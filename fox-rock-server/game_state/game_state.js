const { Entity, EntityList, Player } = require("./entities")

const {map_size_width, map_size_height} = require("../game_config.json")

let default_map = [
	1, 1, 1, 0, 0, 1, 1, 1,
	1, 0, 0, 0, 0, 0, 0, 1, 
	1, 0, 0, 0, 0, 0, 0, 1, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	1, 0, 0, 0, 0, 0, 0, 1, 
	1, 0, 0, 0, 0, 0, 0, 1, 
	1, 1, 1, 0, 0, 1, 1, 1, 
]

class GameState{
	constructor(){
		this.entities = EntityList();
		this.map = Array.from({length : map_size_width}, () => new Array(map_size_height).fill(default_map))

	}


	update(){
		//updates every entity with the information about the other entities
		this.entities.get_list().forEach(entity => {
			entity.update({entities : this.entities.get_list(), map : this.map})
		})
	}

	player_input(player_id, input){
		let player = this.entities.get_list().filter(entity => entity.id == player_id);

		if(player.length !== 0){
			player = player[0]
		}else{
			console.error("no player with the id ", player_id, " exists")
			return
		}

		let { direction, rotation, keyboard } = input

		player.change_walk_state(direction)
		player.change_rotation_state(rotation)
		player.change_keyboard_state(keyboard)
	}

	player_login(player_id){
		let player = new Player([2, 2], 0, player_id);
		this.entities.register_entity(
			player
		)
		return player.serialize()
	}

	player_logout(player_id){
		let found_player = this.entities.get_list().filter(entity => entity.id == player_id);
		
		if(found_player.length !== 0){
			found_player[0].destroy()
		}else{
			console.error("there is no player with the id ", player_id, " registered at the time!")
		}
	}

	serialize(){
		return {
			entities : this.entities.serialize()
		}
	}
}


module.exports = {
	GameState
}
