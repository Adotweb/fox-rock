const { WebSocketServer} = require("ws")
const { GameState } = require("./game_state/game_state")

const crypto = require("crypto")


class HostedServer{

	constructor(http_server, id){
		this.id = id || "/" + crypto.randomUUID();
		this.state = new GameState();
		this.connection = new WebSocketServer({ path : this.id, server : http_server})


		this.connection_list = new Map();

		this.broadcast = (message) => {
			[...this.connection_list.values()].forEach(conn => {
				conn.send(JSON.stringify({
					type : "update", 
					...message
				}))
			})
		}

		this.connection.on("connection", socket => {
			let connection_id = crypto.randomUUID();
			
			this.connection_list.set(connection_id, socket);

			let player_info = this.state.player_login(connection_id);

			socket.id = connection_id;

			socket.send(JSON.stringify({
				...player_info,
				world_map : this.state.map,
				chunk_offset : [50, 50],
				player_id : connection_id,
				type : "initialize",
			}))

			socket.on("close", () => {
				this.state.player_logout(socket.id);
				this.connection_list.delete(socket.id)
			})	

			socket.on("message", proto => {
				const data = JSON.parse(proto.toString());
				let {type} = data;
				if(type == "update"){
					let { input } = data;
					this.state.player_input(socket.id, input)
				}
			})
		})
	}	


	update_server(){
		this.state.update();
		this.broadcast(this.state.serialize())
	}

}

module.exports = {
	HostedServer
}
