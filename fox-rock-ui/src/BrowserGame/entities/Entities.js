
//entity base class
class Entity {
	constructor(position){
		this.position = position
		this.id = crypto.randomUUID();
		this.entity_list = null;
		this.speed = 1;

		//we add a type so we can check what kind of rendering we have to use later
		this.type = "entity"
	}

	//easier way than to push because we can store a reference to the entity state
	register_to(entity_list){
		this.entity_list = entity_list
		entity_list.push(this)
	}
	
	//use the stored entity_list handle to delete this item from it
	destroy(){
		let index = this.entity_list.findIndex((entity) => entity.id === this.id);
		this.entity_list.splice(index, 1)
	}

	//this is to update the position and other state of the entity 
	//update info denotes the information about the other entities and walls and so on
	update(update_info){
	
		//this method is called on every single entity in the list 
		//which is very ineffcient, but for the start there wont be too many entities 

	}

	//this method actually puts something on the screen 
	//this allows us to define custom drawing for every entity
	render(screen_information, mini_map_information){

	}

	//checks if we collided with some entity
	//basically just compares the current position to every othere entities position
	check_collision(entities){
		
	}
	
	//this handles the collision with some given entity(-type)
	handle_collision(entity){

	}
}

export class Ghoul extends Entity {

	constructor(position){
		super(position);
		//we add a name so we can compare what kind of entity were dealing with in collision
		this.name = "ghoul"
		//the distance thresshold when a collision happened
		//dist < this and we collided
		this.radius = 1
	}

	//the ghoul tries to move to the player (through walls for now)
	update(update_info){
	
		let { player_position, entities } = update_info;

		//get the direction to the player	
		let direction_to_player = [
			player_position[0] - this.position[0],
			player_position[1] - this.position[1]
		]

		let mag_to_player = Math.sqrt(direction_to_player[0]**2 + direction_to_player[1]**2);

		//normalize the direction to have length 1
		direction_to_player = [
			direction_to_player[0]/mag_to_player,
			direction_to_player[1]/mag_to_player
		]

		//add the direction * some speed to the entity	
		this.position = [
			this.position[0] + direction_to_player[0] * this.speed,
			this.position[1] + direction_to_player[1] * this.speed,
		]
	
		//check if we have collided
		this.check_collision(entities)
	
	}

	check_collision(entities){

		//we simply loop over every entity in the list
		//(terribly inefficent but i dont care)
		entities.forEach(entity => {
		
			let dist_to_entity = 
				Math.sqrt((entity.position[0] - this.position[0])**2 +
				(entity.position[1] - this.position[1])**2)
				
			if(dist_to_entity < this.radius){
				this.handle_collision(entity)	
			}
		})	

	}


	handle_collision(entity){
		console.log(entity.name)

		//in theory we could do something like 
		//if(entity.name == "bullet"){
		//	entity.destroy
		//}
	}
}
