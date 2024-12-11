const { WebSocketServer } = require("ws");
const { GameState } = require("./game_state/game_state");
const { world_map } = require("./map/map");


const wss = new WebSocketServer({ port : 3000 });

const connections = new Map();


const game_state = new GameState();


wss.on("connection", (socket) => {

	let socket_id = crypto.randomUUID();

	while(connections.has(socket_id)){
		socket_id = crypto.randomUUID();
	}	

	connections.set(socket_id, socket)

	socket.socket_id = socket_id;	


	socket.send(JSON.stringify({
		type : "initialize",
		data : {
			world_map
		}
	}))

	socket.on("close", () => {	
		connections.delete(socket.socket_id);
	})

	socket.on("message", proto => {

		const data = JSON.parse(proto.toString())
	})	
})

const updates_per_second = 40

setInterval(() => {


}, 1000/updates_per_second)
