const {chunk_width, chunk_height, map_offset_x, map_offset_y} = require("../game_config.json")


const crypto = require("crypto")

function EntityList(){
	let list = [];


	function register_entity(entity){
		entity.register_to(list)
	}

	function register_entity_list(entity_list){
		entity_list.forEach(entity => {
			entity.register_to(list)
		})
	}

	function get_list(){
		return list
	}

	function serialize(){
		return list.map(entity => entity.serialize())
	}


	return {
		register_entity, 
		register_entity_list,
		get_list,
		serialize
	}
}


class Entity {
	constructor(position){
		this.position = position || [0, 0];
		this.chunk_coords = [
			Math.floor(this.position[0]/chunk_width),
			Math.floor(this.position[1]/chunk_height)
		]

		this.chunk_pos = [
			this.position[0] % chunk_width,
			this.position[1] % chunk_height
		]

		this.chunk_offset = [50, 50]


		this.id = crypto.randomUUID();
		this.type = "entity"

		this.direction = [0, 0];
		this.speed = 1;

		this.rotation = 0;
		this.rot_direction = 0;
		this.rot_speed = 0;
		
		this.entity_list;
	}
	
	register_to(entity_list){
		entity_list.push(this)
		this.entity_list = entity_list
	}

	destroy(){
		let index = this.entity_list.findIndex(entity => entity.id == this.id);

		if(index !== -1){
			this.entity_list.splice(index, 1);
		}
	}

	//update_info holds information about other entities
	update(){

		this.rotation += this.rot_direction * this.rot_speed * Math.PI/180


		this.position = [
			this.position[0] + this.direction[0] * this.speed,
			this.position[1] + this.direction[1] * this.speed
		]

		this.chunk_coords = [
			Math.floor(this.position[0]/8),
			Math.floor(this.position[1]/8)
		]

		this.chunk_pos = [
			this.position[0] % 8,
			this.position[1] % 8
		]


		console.log(this.position)
		
	}

	serialize(){
		return {
			position : this.position,
			chunk_coords : this.chunk_coords,
			chunk_pos : this.chunk_pos,
			rotation : this.rotation,
			type : this.type,
			name : this.name,
			id : this.id
		}
	}

}


class Player extends Entity{
	constructor(position, rotation, socket_id){
		super(position)
		
		this.id = socket_id	

		this.name = "player"
		this.speed = 1;
		this.rotation = rotation;
		this.direction = [0, 0]
		this.rot_direction = 0
		this.rot_speed = 1;
	}

	change_walk_state(direction){
		let mag = Math.sqrt(direction[0]**2 + direction[1]**2);
		if(mag == 0){
			mag = 1
		}
		this.direction = [
			direction[0]/mag,
			direction[1]/mag
		]
	}

	change_rotation_state(rot_direction){
		this.rot_direction = rot_direction	
	}

}

module.exports = {
	Entity,
	Player,
	EntityList
}
