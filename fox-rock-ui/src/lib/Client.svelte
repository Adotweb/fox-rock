<script>
//function to change the mode of the window
let props = $props();

let decide_mode = props.decide_mode;

import { onMount } from "svelte"
import { entity_rendering_map } from "../rendering/render-entites/entities";
import { mini_map_h, mini_map_w, screen_h, screen_w } from "../state/config.svelte";
import { render_mini_map, render_buffer, prepare_edges, prepare_entities, load_edges, load_chunks } from "../rendering/rendering.svelte"
import { global_state } from "../state/global.svelte"
    import { get } from "svelte/store";
    import { connection } from "../state/connection.svelte";

import { default_server_url } from "../state/config.svelte"


let host_connection = new WebSocket(default_server_url);



//init
onMount(() => {
	//set the contexts as soon as they are ready
	ctx = screen.getContext("2d");
	mini_map_ctx = mini_map.getContext("2d")


	create_send_function();
	host_connection.onmessage = host_connection_on_message;	
})

//give a handle to the send input function 
let send_input;

//storage variable for the id later
let player_id;


//this is a handle to store messages like "you died" and "you ki**ed someone"
let messages = $state([])

let create_send_function = () => {

	//when the websocket connection or p2p connection is established we set the sendinput function
	send_input = (update) => host_connection.send(JSON.stringify({
		input : update,	
		type : "update",
		group_id : get(connection)
	}))

}

let host_connection_on_message = (proto) => {

	
	let data = JSON.parse(proto.data);


	//the first message well receive from the server is the initial message that contains:
	//- our player id 
	//- our position and roation
	//- the map and its offset 
	//- and the chunk width and height
	if(data.type == "initialize"){


		world_map = data.world_map

		player_id = data.player_id
		
		chunk_offset = data.chunk_offset;
		player_pos = data.position;
		chunk_coords = data.chunk_coords;
		chunk_pos = data.chunk_pos;
		rot = data.player_rot;

		global_state.update(state => {
			let new_state = {};

			new_state.chunk_offset = chunk_offset
			new_state.player_pos = player_pos
			new_state.chunk_pos = chunk_pos
			new_state.player_rot = rot 
			new_state.world_map = world_map
			
			return {
				...state,
				...new_state
			}
		})

		//chunk_w = data.chunk_width;
		//chunk_h = data.chunk_height;

		return
	}

	//an update is sent every couple of milliseconds to keep the state of the server and client synced	
	if(data.type == "update"){
		

		//first we update every entities state and rendering that is not the player
		entities = data.entities
		.filter(entity => entity.id !== player_id)
		.map(entity => new entity_rendering_map[entity.name](entity.position, player_pos, rot))

		

		//we need to isolate the player from the entitites in the servers state	
		let player = data.entities.filter(entity => entity.id == player_id)[0];

		if(player.messages.length > 0){
			messages.push(player.messages)
			messages = messages.flat();
		}

		//set health and relative health
		health = player.health;	
		relative_health = player.health/player.max_health * 100

		//now we get the new positions to later check if we have changed (to save time in rendering)
		let new_chunk_coords = player.chunk_coords;
		let new_player_pos = player.position;
		let new_rot = player.rotation;
		let new_chunk_pos = player.chunk_pos;


		//we check if the players position has somehow changed, if it has we update the rendering of walls etc, else we skip this step
		if(
			new_chunk_pos[0] == chunk_pos[0] && new_chunk_pos[1] == chunk_pos[1] && 
			new_player_pos[0] == player_pos[0] && new_player_pos[1] == player_pos[1] &&
			new_chunk_coords[0] == chunk_coords[0] && new_chunk_coords[1] == chunk_coords[1] &&
			new_rot == rot
		)			{
			return
		}else{
			

			//overwrite the old values
			chunk_coords = new_chunk_coords;
			player_pos = new_player_pos;
			chunk_pos = new_chunk_pos;
			rot = new_rot

			global_state.update(state => {
				return {
					...state, 
					chunk_coords, 
					chunk_pos, 
					player_pos, 
					player_rot: rot
				}

			})

			//empty the edge and mini_map render buffers
			edges = [];
			mini_map_squares = [];

			//load the new chunks 
			load_chunks(loaded_chunks);


			load_edges(loaded_chunks, edges, mini_map_squares);
			
		}
	}
	
}

//input direction
let direction = [0, 0];
//the direction in which we are rotating
let rot_dir = 0;
//the above two will only ever be sent to the server and have no use for the clients code

//this health is the actual health the player still has
let health = $state(0)

//this health is relative to the players max health to make div calculations easier
let relative_health =  $state(100)

//keyboard inputs
//1 is pressed 0 is not
let keyboard = {
	"space" : 0
}

//input map to overwrite the direction and rot_dir
function onkeydown(e){
	if(e.key == "w"){
		direction[1] = -1;
	}if(e.key == "a"){
		direction[0] = -1;
	}if(e.key == "s"){
		direction[1] = 1;
	}if(e.key == "d"){
		direction[0] = 1;
	}if(e.key == "ArrowLeft"){
		rot_dir = -1
	}if(e.key == "ArrowRight"){
		rot_dir = 1
	} if(e.key == "Escape"){
		decide_mode("menu")
	}
	//abilities and shooting
	if(e.key == " "){
		keyboard.space = 1;	
	}
}

//same here
function onkeyup(e){
	if(e.key == "w"){
		direction[1] = 0;
	}if(e.key == "a"){
		direction[0] = 0;
	}if(e.key == "s"){
		direction[1] = 0;
	}if(e.key == "d"){
		direction[0] = 0;
	}if(e.key == "ArrowLeft"){
		rot_dir = 0
	}if(e.key == "ArrowRight"){
		rot_dir = 0
	}
	//abilities and shooting
	if(e.key == " "){	
		keyboard.space = 0;	
	}
}
//game state things

//player_position 
let player_pos = [0, 0];
//the current rotation of the player
let rot = 0;
//position of the chunk the players in 
let chunk_pos = [0, 0];
//position of the player relative to the chunks [0, 0] coordinate
let chunk_coords = [0, 0];
//this is the center chunk (if the array is 100x100 chunks big then the offset will be [50, 50])
let chunk_offset = [0, 0];

//the width and height of a single chunk
let chunk_w = 8;
let chunk_h = 8;

//we start by filling some randomg array 
//this will be overwritten with the data that is sent by the server
let world_map = Array.from({length : 100}, () => new Array(100).fill(false));


//we write some random array into the first chunk /doesnt really matter, this array will be overwritten anyway
world_map[chunk_offset[0]][chunk_offset[1]] = [
	1, 1, 1, 0, 0, 1, 1, 1, 
	1, 0, 0, 0, 0, 0, 0, 1, 
	1, 0, 0, 0, 0, 0, 0, 1,
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0,
	1, 0, 0, 0, 0, 0, 0, 1,
	1, 0, 0, 0, 0, 0, 0, 1,
	1, 1, 1, 0, 0, 1, 1, 1
]



//screen stuff
let w = screen_w; 
let h = screen_h;

//store handles to the screen and its context (for drawing later)
let screen;
let ctx;


//same here for the mini-map screen
let mini_map;
let mini_map_ctx;

//rendering
let render_dist = 1;
//the buffer with the loaded chunks in it
let loaded_chunks = [];
//the buffer of all edges  in the current loaded chunks
//i should really be talking about faces, but since the game could very well be played just top down ill stick to edges
let edges = [];
//the buffer of all points to draw them on the mini-map
let mini_map_squares = [];

//entity buffer
let entities = [];


//the buffer of all faces, entities and so on from back to front, so we can do a painters algorithm
let render_order = [];






//main game loop
//repeat the below loop 60 times each second
let fps = 60
let deactivate_id = setInterval(() => {
	

	if(host_connection.readyState == WebSocket.CLOSED || host_connection.readyState == WebSocket.CLOSING){
		clearInterval(deactivate_id)
	}

	//clear the render_order buffer
	render_order = [];

	//if either context is undefined we skip the rendering
	if(!ctx || !mini_map_ctx){
		return
	}

	

	//clear the canvases to redraw
	ctx.clearRect(0, 0, w, h);
	mini_map_ctx.clearRect(0, 0, mini_map_w, mini_map_h)
	
	//render the squares to the mini-map
	render_mini_map(mini_map_squares, mini_map_ctx)

	//send the player input to the server/p2p-host
	send_input({
		direction,
		rotation : rot_dir,
		keyboard
	});

	
	prepare_edges(edges, render_order);
	prepare_entities(entities, render_order)

	//render the 3d edges, entities and entity points to the mini-map
	render_buffer(ctx, mini_map_ctx, render_order)

}, 1000/fps)

</script>

<style>
/* this makes the mini-map a circle at the top right*/
.mini-map{
	position:absolute;
	top:10px;
	right:10px;
	background-color: white;
	height: 300px;
	width:300px;
	border-radius: 50%;
	border : 1px solid black;
}

.screen{
	border : 1px solid black;
}

.health-bar{
	position: relative;
	width : 400px;
	height : 30px;
	border : 1px solid black;
	margin : 4px;

	.health-bar-row{
		height : 100%;
		background-color: green;
	}
}

.message-board{
	
	position: absolute;
	top: 0px;
	left : 0px;

	border : 1px solid black;
	width : 200px;
	height : 200px;
}

</style>

<svelte:window {onkeyup} {onkeydown}></svelte:window>

<div class="health-bar" >
	<div class="health-bar-row" style="width:{relative_health}%;">
		<div class="health-display">
			{health} / {health/(relative_health) * 100}
		</div>
	</div>
</div>

<div class="message-board">
	{#each messages as message}
		<div>[{message.time}] {message.text}</div>	
	{/each}
</div>

<canvas class="mini-map" bind:this={mini_map} width={mini_map_w} height={mini_map_h}></canvas>

<canvas class="screen" bind:this={screen} width={w} height={h}></canvas>


