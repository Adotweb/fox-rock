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

		console.log(world_map, player_id)
		return
	}


	game_state = data;		
	
}

//game state things

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
	console.log(player_id)

}, 1000/fps)

</script>

<style>
	
.mini-map{
	position : absolute;
	top: 0px;
	right : 0px;
}

</style>

<canvas class="mini-map" bind:this={mini_map} height={mini_map_h} width={mini_map_w}></canvas>

<canvas bind:this={screen} width={w} height={h}></canvas>
