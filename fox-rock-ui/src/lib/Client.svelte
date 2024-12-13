<script>
import { onMount } from "svelte"

//game connection things
let ws_connection = new WebSocket("ws://localhost:3000");

let send_input;

let player_id;

ws_connection.onopen = () => {

	send_input = (update) => ws_connection.send(JSON.stringify({
		input : update,	
		type : "update"
	}))

}

ws_connection.onmessage = (proto) => {


	let data = JSON.parse(proto.data);


	if(data.type == "initialize"){


		world_map = data.world_map

		player_id = data.player_id
		
		chunk_offset = data.chunk_offset;
		player_pos = data.position;
		chunk_coords = data.chunk_coords;
		chunk_pos = data.chunk_pos;
		rot = data.player_rot;


		return
	}

	
	if(data.type == "update"){
		
		let player = data.entities.filter(entity => entity.id == player_id)[0];
		
		chunk_coords = player.chunk_coords;
		player_pos = player.position;
		rot = player.rotation;
		chunk_pos = player.chunk_pos;
		
		
	}
	
}

//input
let direction = [0, 0];
let rot = 0;

function onkeydown(e){
	if(e.key == "w"){
		direction[1] = -1;
	}if(e.key == "a"){
		direction[0] = -1;
	}if(e.key == "s"){
		direction[1] = 1;
	}if(e.key == "d"){
		direction[0] = 1;
	}
}

function onkeyup(e){
	if(e.key == "w"){
		direction[1] = 0;
	}if(e.key == "a"){
		direction[0] = 0;
	}if(e.key == "s"){
		direction[1] = 0;
	}if(e.key == "d"){
		direction[0] = 0;
	}
}
//game state things

//player_position 

let player_pos = [0, 0];
let chunk_pos = [0, 0];
let chunk_coords = [0, 0];
let chunk_offset = [0, 0];


let world_map = Array.from({length : 100}, () => new Array(100).fill(false));

world_map[50][50] = [
	1, 1, 1, 0, 0, 1, 1, 1, 
	1, 0, 0, 0, 0, 0, 0, 1, 
	1, 0, 0, 0, 0, 0, 0, 1,
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0,
	1, 0, 0, 0, 0, 0, 0, 1,
	1, 0, 0, 0, 0, 0, 0, 1,
	1, 1, 1, 0, 0, 1, 1, 1
]
let game_state;


//screen stuff

let w = 800;
let h = 800;

let screen;
let ctx;


let mini_map_w = 300;
let mini_map_h = 300;
let mini_map;
let mini_map_ctx;

onMount(() => {
	ctx = screen.getContext("2d");
})


//main game loop
let fps = 60

setInterval(() => {
	send_input({
		direction,
		rotation : rot
	});
	console.log(player_pos, chunk_pos, chunk_coords)
}, 1000/fps)

</script>

<style>
	
.mini-map{
	position : absolute;
	top: 0px;
	right : 0px;
}

</style>

<svelte:window {onkeyup} {onkeydown}></svelte:window>

<canvas class="mini-map" bind:this={mini_map} height={mini_map_h} width={mini_map_w}></canvas>

<canvas bind:this={screen} width={w} height={h}></canvas>
