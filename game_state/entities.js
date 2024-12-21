const {chunk_width, chunk_height, map_offset_x, map_offset_y} = require("../game_config.json")


const crypto = require("crypto");
const { Pistol, HealItem } = require("./weapons");

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
			this.position[0] % chunk_width,
			this.position[1] % chunk_height
		]

		this.chunk_pos = [
			Math.floor(this.position[0] / chunk_width),
			Math.floor(this.position[1] / chunk_height)
		]

		this.chunk_offset = [
			map_offset_x, map_offset_y
		]


		this.id = crypto.randomUUID();
		this.type = "entity"

		this.direction = [0, 0];
		this.speed = 0.01;

		this.rotation = 0;
		this.rot_direction = 0;
		this.rot_speed = 0;
		
		this.entity_list;

		this.state = "normal"

		this.health = 100;
		this.max_health = 100;
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
	update(update_info){
		//reset messages so they dont hog up bandwith
		this.messages = [];


		let previous_pos = this.position;
		let previous_rot = this.rotation;
		let previous_chunk_pos = this.chunk_pos;
		let previous_chunk_coords = this.chunk_coords;

		this.rotation += -this.rot_direction * this.rot_speed * Math.PI/180

		//get the rotation in sync again
		//basically we just reduce by 2PI to get back to the 0 - 2PI cycle
		if(this.rotation >= 2 * Math.PI){
			this.rotation -= 2 * Math.PI
		}	


		this.position = [
			this.position[0] + this.direction[0] ,
			this.position[1] + this.direction[1] 
		]


		this.chunk_coords = [
			this.position[0] % chunk_width,
			this.position[1] % chunk_height
		]

		this.chunk_pos = [
			Math.floor(this.position[0] / chunk_width),
			Math.floor(this.position[1] / chunk_height)
		]

		let collided = this.check_collision(update_info)

		if(collided){
			this.position = previous_pos;
			this.rotation = previous_rot;
			this.chunk_coords = previous_chunk_coords;
			this.chunk_pos = previous_chunk_pos;
		}			
	}

	check_collision({map, entities}){
	}

	serialize(){
		return {
			position : this.position,
			chunk_coords : this.chunk_coords,
			chunk_pos : this.chunk_pos,
			rotation : this.rotation,
			type : this.type,
			name : this.name,
			id : this.id,
			health: this.health,
			max_health : this.max_health,
			state : this.state,
		}
	}

}


class Player extends Entity{
	constructor(position, rotation, socket_id){
		super(position)
		
		this.id = socket_id	

		this.name = "player"
		this.speed = 0.1;
		this.rotation = rotation;
		this.direction = [0, 0]
		this.rot_direction = 0
		this.rot_speed = 3;

		this.keyboard_state = {}


		this.messages = []

		this.inventory = [new Pistol(), new HealItem()];
		this.inventory_index = 1
	}

	change_walk_state(direction){
		let mag = Math.sqrt(direction[0]**2 + direction[1]**2);
		if(mag == 0){
			mag = 1
		}
		this.direction = [
			(direction[0] * Math.cos(this.rotation) + direction[1] * Math.sin(this.rotation))/mag * this.speed,
			(direction[0] * Math.sin(this.rotation) - direction[1] * Math.cos(this.rotation))/mag * this.speed,
		]
	}



	change_rotation_state(rot_direction){
		this.rot_direction = rot_direction	
	}

	change_keyboard_state(keyboard){
		this.keyboard_state = keyboard
	}

	update(update_info){
		super.update(update_info);

		this.use_held_item(update_info)


		if(this.health <= 0){
			this.health = this.max_health;

			this.messages.push({text : `you died and respawned at [${this.position[0]}, ${this.position[1]}]`, time : Date.now()})
			this.position = [2, 2]
		}

		if(this.health > this.max_health){
			this.health = this.max_health
		}

		this.inventory.forEach(item => item.update_reloading_state(Date.now()))
	}

	//player own serialize 
	serialize(){
		let primitive_serialization = super.serialize();
		return {
			...primitive_serialization, 
			messages : this.messages,
			current_item : {
				name : this.inventory[this.inventory_index - 1].name,
				uses : this.inventory[this.inventory_index - 1].uses_left,
				reloaded_in : this.inventory[this.inventory_index - 1].reloaded_in
			}
		}
	}

	check_collision({ map, entities }){
		let ccx = this.chunk_coords[0]
		let ccy = this.chunk_coords[1]

		ccx = ccx < 0 ? ccx + 8 : ccx
		ccy = ccy < 0 ? ccy + 8 : ccy

		let map_index = Math.floor(ccy) * 8 + Math.floor(ccx)

		let chunk = map[this.chunk_pos[0] + this.chunk_offset[0]][this.chunk_pos[1] + this.chunk_offset[1]];

		if(chunk[map_index] == 1){
			return true
		}


	

		return false;
	}

	//this method just computes the entities world rotation difference as well as the distance to the player
	use_held_item({ entities, map}){
		if(this.keyboard_state.number && this.keyboard_state.number <= this.inventory.length){
			this.inventory_index = this.keyboard_state.number || 1
		}
		let held_item = this.inventory[this.inventory_index - 1]


		if(this.keyboard_state.space == 0){
			held_item.clear_item();
		}
		if(this.keyboard_state.space == 1){
			held_item.apply_item({entities, map}, this)
		}	
	}
}



module.exports = {
	Entity,
	Player,
	EntityList
}
