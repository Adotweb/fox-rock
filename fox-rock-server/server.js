const { WebSocketServer } = require("ws");
const { GameState } = require("./game_state/game_state");
const { world_map } = require("./map/map");

const crypto = require("crypto")

const wss = new WebSocketServer({ port : 3000 });

const connections = new Map();


const game_state = new GameState();

function broad_cast(message){

	[...connections.values()].forEach(socket => {
	
		socket.send(JSON.stringify(message))

	})
	
}

wss.on("connection", (socket) => {

	let socket_id = crypto.randomUUID();

	while(connections.has(socket_id)){
		socket_id = crypto.randomUUID();
	}	

	connections.set(socket_id, socket)


	game_state.player_login(socket_id)
	socket.socket_id = socket_id;	


	socket.send(JSON.stringify({
		type : "initialize",
		data : {
			world_map
		}
	}))

	socket.on("close", () => {	
		game_state.player_logout(socket.socket_id)
		connections.delete(socket.socket_id);
	})

	socket.on("message", proto => {

		const data = JSON.parse(proto.toString())

		let { type } = data;

		if(type == "update"){
			let { input } = data;
			game_state.player_input(socket.socket_id, input)
		}
	})	
})

const updates_per_second = 40

setInterval(() => {
	game_state.update()
	
	broad_cast(game_state.serialize())

}, 1000/updates_per_second)
