import { chunk_width, chunk_height, } from "../server-config.svelte"

//we maintain a list so that we can register entities with methods within the entity 
//and destroy them from within as well when we want to 
//i made this a function because making it a class messed up the context
export function EntityList(){
	let list = [];

	//the function to regsiter a given entity
	function register_entity(entity){
		entity.register_to(list)
	}

	//never used so far, to register a whole bunch of entities
	function register_entity_list(entity_list){
		entity_list.forEach(entity => {
			entity.register_to(list)
		})
	}

	//returns the actual list 
	function get_list(){
		return list
	}

	//returns a json array of every single entity in json format
	function serialize(){
		return list.map(entity => entity.serialize())
	}

	//expose the methods to the outside
	return {
		register_entity, 
		register_entity_list,
		get_list,
		serialize
	}
}


class Entity {
	//entities start at some position
	constructor(position){
		this.position = position || [0, 0];

		//the position relative to the current chunks (0, 0) coordinate
		this.chunk_coords = [
			this.position[0] % chunk_width,
			this.position[1] % chunk_height
		]

		//the position of the chunk the player is standing in (not adjusted by chunk offset)
		this.chunk_pos = [
			Math.floor(this.position[0] / chunk_width),
			Math.floor(this.position[1] / chunk_height)
		]
	
		//the amount the (0, 0) chunk is offsetted 
		//offset of [50, 50] means the (0, 0) chunk is placed at [50, 50] in the worldmap array
		this.chunk_offset = [50, 50]

		
		this.id = crypto.randomUUID();
		this.type = "entity"
		
		//this are the only ways the player can actually "update" any entity (being themselves)
		//by setting these the game loop can compute the next position by itself
		this.direction = [0, 0];
		this.rot_direction = 0;
		
		//i guess this could also be set by the player (through powerups for example)
		this.speed = 0.01;

		this.rotation = 0;
		this.rot_speed = 1;
		this.name = "default"	

		//this is a reference to the original enttiy list so we can remove this entity from the list as soon as we destroy it
		this.entity_list;
	}
	
	//this is the method to put an entity to the entity list
	register_to(entity_list){
		entity_list.push(this)
		this.entity_list = entity_list
	}

	//and this is to remove it
	destroy(){
		//get the index in the original list
		let index = this.entity_list.findIndex(entity => entity.id == this.id);

		//then splice the array because splicing is an in-place operation
		if(index !== -1){
			this.entity_list.splice(index, 1);
		}
	}

	//update_info holds information about other entities
	update(update_info){
		
		//we first store the old to reset in case of collision or other events
		let previous_pos = this.position;
		let previous_rot = this.rotation;
		let previous_chunk_pos = this.chunk_pos;
		let previous_chunk_coords = this.chunk_coords;


		//we first update the rotation
		this.rotation += -this.rot_direction * this.rot_speed * Math.PI/180

		//then we update the position
		//depending on the entity we are encoding this direction is computed in terms of roation
		this.position = [
			this.position[0] + this.direction[0] ,
			this.position[1] + this.direction[1] 
		]

		//then the chunk coordinates and position are updated
		this.chunk_coords = [
			this.position[0] % chunk_width,
			this.position[1] % chunk_height
		]

		this.chunk_pos = [
			Math.floor(this.position[0] / chunk_width),
			Math.floor(this.position[1] / chunk_height)
		]

		//after weve done all of this we check if we have collided with something
		let collided = this.check_collision(update_info)

		if(collided){
			this.position = previous_pos;
			this.rotation = previous_rot;
			this.chunk_coords = previous_chunk_coords;
			this.chunk_pos = previous_chunk_pos;
		}			
	}
	
	//the update_info contains information about every entity (which is not that effcient, but it was fast to implement)
	//also it contains information about the whole world map so we can check for wall collision
	check_collision({map, entities}){
		return false;
	}

	//serialize just returns the fields of interest in an object so it can later be JSON stringified
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

//we make the player an entity and not something else so we can easily render it in one go with other entities 
//when we send it to any given player for rendering (this way a single player is just another entity)
export class Player extends Entity{
	//the player has a start position so that we can set it to a 
	//specific position when we load a certain save (later on at least)
	constructor(position, rotation, socket_id){
		super(position)
		
		this.id = socket_id	

		this.name = "player"
		this.speed = 0.1;
		this.rotation = rotation;
		this.direction = [0, 0]
		this.rot_direction = 0
		this.rot_speed = 3;
	}

	//this updates the given player
	change_walk_state(direction){
		//first we compute the magnitude of the current direction to later normalize
		let mag = Math.sqrt(direction[0]**2 + direction[1]**2);
		//if the magnitude is 0 we error usually so we just set the mag to 1
		if(mag == 0){
			mag = 1
		}

		//then the direction is rotated so that we move along the direction we are looking at
		//also we multiply the direction by the speed 
		//technically we would need to do x*cos - y*sin and y*sin + x*sin but the direction of the y axis is flipped 
		//(because 2d arrays have 0, 0 at the top left)
		//so we need to flip the y component
		//
		//x*cos + y*sin 
		//x*sin - y*cos
		//
		this.direction = [
			(direction[0] * Math.cos(this.rotation) + direction[1] * Math.sin(this.rotation))/mag * this.speed,
			(direction[0] * Math.sin(this.rotation) - direction[1] * Math.cos(this.rotation))/mag * this.speed,
		]
	}

	
	change_rotation_state(rot_direction){
		this.rot_direction = rot_direction	
	}
	
	//the player can at the time only collide with walls, which is done trivially
	check_collision({ map, entities }){

		//we get the players chunk coordinates
		let ccx = this.chunk_coords[0]
		let ccy = this.chunk_coords[1]

		//if the chunk coordinates are smaller than 0 
		//which is really seldom we add 8 to remove errors
		ccx = ccx < 0 ? ccx + 8 : ccx
		ccy = ccy < 0 ? ccy + 8 : ccy


		//then we get the players index inside of the current chunk by computing this thing of y * 8 (=so many rows down) + x (so many cells forward)
		let map_index = Math.floor(ccx) * 8 + Math.floor(ccy)

		//we get the chunks from the worldmap array and test if the map_index inside of the chunks is 1
		let chunk = map[this.chunk_pos[0] + this.chunk_offset[0]][this.chunk_pos[1] + this.chunk_offset[0]];

		//if it is we collided and return that
		if(chunk[map_index] == 1){
			return true
		}

		return false;
	}
}

