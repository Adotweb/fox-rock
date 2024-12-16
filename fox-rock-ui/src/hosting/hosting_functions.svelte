<script>

let props = $props();

let decide_mode = props.decide_mode;

import { GameState } from "./game_state/game_state.svelte"

import Peer from "peerjs"


let host_connection = new Peer(crypto.randomUUID(), {
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }, // Google's free STUN server
        ]
    }
});


let host_connection_id = $state();

host_connection.on("open", id => {
	host_connection_id = id;	
})


const connections = new Map();
let connection_ids = $state([]);

const game_state = new GameState();

function broadcast(message){

	[...connections.values()].forEach(socket => {
	
		socket.send(JSON.stringify({type : "update" , ...message}))

	})
	
}

host_connection.on("connection", (socket) => {

	let socket_id = socket.peer;

	connections.set(socket_id, socket)
	
	connection_ids = [...connections.keys()]

	let player_info = game_state.player_login(socket_id)
	

	socket.on("close", () => {	
		game_state.player_logout(socket_id)
		connections.delete(socket_id);
	})


	socket.on("open", () => {
		socket.send(JSON.stringify({
			...player_info,
			world_map : game_state.map,
			chunk_offset : [50, 50],
			player_id : socket_id,
			type : "initialize",
		}))	
	})


	socket.on("data", proto => {
		const data = JSON.parse(proto)

		let { type } = data;
		

		if(type == "update"){
			let { input } = data;
			game_state.player_input(socket_id, input)
		}
	})
})

const updates_per_second = 40

setInterval(() => {
	game_state.update()
	
	broadcast(game_state.serialize())

}, 1000/updates_per_second)

</script>

<div>
	
	<div>
		<div>Server id is</div>
		<div>{host_connection_id}</div>
	</div>	
	<br>
	<div>
		<h3>
			Connected Players by id	
		</h3>
		<ul>
		{#each connection_ids as conn_id}
			<li>{conn_id}</li>	
		{/each}
		</ul>
	</div>

</div>
