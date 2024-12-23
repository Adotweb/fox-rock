const { GameState } = require("./game_state/game_state");

const { map_offset_x, map_offset_y } = require("./game_config.json")

const crypto = require("crypto")

class ServerGroup{
	constructor(group_id, server_list, map, map_size){
		this.group_id = group_id || crypto.randomUUID();

		this.connections = new Map();

		this.state = new GameState(map, map_size);

		this.last_update = Date.now();
		
		this.server_list = server_list

		this.players = 1;
	}	

	new_connection(socket){
		if(!socket.first_connection){
			return
		}
		socket.first_connection = false;
		let connection_id = crypto.randomUUID();

		this.connections.set(connection_id, socket);

		let player_info = this.state.player_login(connection_id);

		socket.id = connection_id;

		socket.on("close", () => {
				this.state.player_logout(socket.id);
				this.connections.delete(socket.id)

				this.players = this.connections.size
			})


		socket.send(JSON.stringify({
			...player_info,
			world_map : this.state.map,
			chunk_offset : [0, 0],
			player_id : connection_id,
			type : "initialize",
		}))
	}

	message_listener(data, socket_id){
		let {type} = data;
		if(type == "update"){
			let { input } = data;
			this.state.player_input(socket_id, input)
			this.last_update = Date.now()
		}
	}


	update(){
		let now = Date.now()


		if(now - this.last_update > 5 * 1000 * 60 && this.server_list){
			this.server_list.delete(this.group_id)
			console.log("i closed because of inactivity")
			return 
		}
		
		if(this.players == 0 && this.server_list){
			this.server_list.delete(this.group_id)
			console.log("i closed because i dont have any players")
			return
		}

		this.state.update();

		[...this.connections.values()].forEach(conn => {
			
			conn.send(JSON.stringify({
				type : "update",
				...this.state.serialize()
			}))
		})
	}

	broadcast(message){
		[...this.connections.values()].forEach(socket => {
			socket.send(JSON.stringify({
				type : "update", 
				...message
			}))	
		})
	}
}

module.exports = {
	ServerGroup
}
