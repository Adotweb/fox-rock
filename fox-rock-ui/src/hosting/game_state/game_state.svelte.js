import {EntityList, Player} from "./entities.svelte"

export let default_map = [
	1, 1, 1, 0, 0, 1, 1, 1,
	1, 0, 0, 0, 0, 0, 0, 1, 
	1, 0, 0, 0, 0, 0, 0, 1, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	1, 0, 0, 0, 0, 0, 0, 1, 
	1, 0, 0, 0, 0, 0, 0, 1, 
	1, 1, 1, 0, 0, 1, 1, 1, 
]

export class GameState{
	constructor(){
		this.entities = EntityList();
		this.map = Array.from({length : 100}, () => new Array(100).fill(default_map))
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

		let { direction, rotation } = input

		player.change_walk_state(direction)
		player.change_rotation_state(rotation)
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



