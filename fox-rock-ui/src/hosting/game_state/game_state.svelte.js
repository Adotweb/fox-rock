import {EntityList, Player} from "./entities.svelte"


//this is just a default map for dev purposes
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

//the game state class abstracts the most funcitonality away from the host_functions component
export class GameState{
	constructor(){
		//we initiate the entity list of the game
		this.entities = EntityList();
		//as well as some map
		//this will include some code in the future to randomly generate maps
		this.map = Array.from({length : 100}, () => new Array(100).fill(default_map))
	}


	update(){
		//updates every entity with the information about the other entities
		//as well as the map
		this.entities.get_list().forEach(entity => {
			//this first updates the position (if we didnt collide with anything or something else happens)
			entity.update({entities : this.entities.get_list(), map : this.map})
		})
	}
	
	//player input is handled through a method on this
	player_input(player_id, input){
		//we first get the palyer with the given player id so we can update just it
		let player = this.entities.get_list().filter(entity => entity.id == player_id);

		//then we check if this player_id even exists
		if(player.length !== 0){
			player = player[0]
		}else{
			console.error("no player with the id ", player_id, " exists")
			return
		}

		let { direction, rotation } = input
		//then we update the player with the input information	
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



