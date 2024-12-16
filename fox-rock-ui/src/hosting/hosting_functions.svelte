<script>

let props = $props();

let decide_mode = props.decide_mode;

import { GameState } from "./game_state/game_state.svelte"

import Peer from "peerjs"


let host_connection = new Peer();
let host_connection_id = $state();

host_connection.on("open", id => {
	host_connection_id = id;	
})

const connections = new Map();

const game_state = new GameState();

function broadcast(message){

	[...connections.values()].forEach(socket => {
	
		socket.send(JSON.stringify({type : "update" , ...message}))

	})
	
}

host_connection.on("connection", (socket) => {

	let socket_id = crypto.randomUUID();

	while(connections.has(socket_id)){
		socket_id = crypto.randomUUID();
	}	

	connections.set(socket_id, socket)


	let player_info = game_state.player_login(socket_id)

	socket.on("open", connection => {

		console.log(socket_id)

		connection.send(JSON.stringify({
			...player_info,
			world_map : game_state.map,
			chunk_offset : [50, 50],
			player_id : socket_id,
			type : "initialize",
		}))

		connection.on("close", () => {	
			game_state.player_logout(socket_id)
			connections.delete(socket_id);
		})

		connection.on("data", proto => {

			const data = JSON.parse(proto)

			let { type } = data;
		

			if(type == "update"){
				let { input } = data;
				game_state.player_input(socket_id, input)
			}
		})	

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

</div>
