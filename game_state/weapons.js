


function find_wall_intersection_with_bresenham(start_pos, ray_angle, map){	  
	
	let [x0, y0] = start_pos;
	let length = 100;
	let [x1, y1] = [
		Math.floor(Math.cos(ray_angle + Math.PI/2) * length + x0),
		Math.floor(Math.sin(ray_angle + Math.PI/2) * length + y0)
	]

  	let points = [];
  	let dx = Math.abs(x0 - x1);
 	let dy = Math.abs(y0 - y1);
  	let sx = x0 < x1 ? 1 : -1;
  	let sy = y0 < y1 ? 1 : -1;
  	let err = dx - dy;
  
  	while(true){

		let chunk_pos = [
			Math.floor(x0/8),
			Math.floor(y0/8)
		]

		let chunk_coords = [
			x0 % 8,
			y0 % 8
		]
		try{
			let chunk = map[chunk_pos[0]][chunk_pos[1]];
			let cell_index = Math.floor(chunk_coords[0]) * 8 + Math.floor(chunk_coords[1])
			let cell = chunk[cell_index]
			if(cell == 1){
				return [Math.round(x0) , Math.round(y0)]
			}
		}catch(e){
			return points.at(-1)
		}
	
    		points.push([x0, y0])
   


    		if(x0 == x1 && y0 == y1){
			break;
    		}
    		let e2 = 2 * err;
    
   		if(e2 > -dy){
      			err -= dy;
      			x0 += sx
    		}
    		if(e2 < dx){
      			err += dx;
      			y0 += sy
    		}
	}

	return points
}


class Item{
	constructor(){
		this.used = false;

		this.spammable = false;

		this.max_uses = 1;
		this.uses_left = 1;
		this.last_update = 0;
		//in milliseconds
		this.reload_time = 0;
		//in milliseconds as well
		this.reloaded_in = 0;
	}
		
	//creates candidates for hitscanning 
	create_candidates({entities, map}, self){
		let candidates = [
				
		]
		entities.forEach(entity => {
		
			if(entity.id == self.id) return

			let dir_to_entity = [
				entity.position[0] - self.position[0],
				entity.position[1] - self.position[1]
			]


				
			//compute the rotation based on the direction (flip because of empiricism)
			let rot_to_entity = -Math.atan2(dir_to_entity[0], dir_to_entity[1])

			let rotation_difference = Math.abs(rot_to_entity - self.rotation)
		
			let wall_intersect = find_wall_intersection_with_bresenham(self.position, self.rotation, map)	

			let distance_to_wall_intersect = wall_intersect;

			if(wall_intersect){
				distance_to_wall_intersect = Math.sqrt(
					(self.position[0] - wall_intersect[0])**2 + 
					(self.position[1] - wall_intersect[1])**2
				)
			}			

			let distance = Math.sqrt(dir_to_entity[0]**2 + dir_to_entity[1]**2)	
			
			candidates.push({distance, entity, rotation_difference, wall_intersect, distance_to_wall_intersect})

		})
		return candidates
	}	


	update_reloading_state(now){
		if(this.uses_left >= 1){
			return
		}
		if(this.last_update == 0){
			this.last_update = now;
			return
		}

		if(now - this.last_update < this.reload_time){
			this.reloaded_in = this.reload_time - (now - this.last_update);

			return
		}

		this.last_update = 0;
		this.uses_left = this.max_uses
	}

	//actually applies the effect of the item to every entit
	apply_item(candidates, self){
		used = true;				
	}

	clear_item(){
		used = false;
	}
}

class Weapon extends Item{
	constructor(){
		super();	
		
	}
}

class Pistol extends Weapon{
	constructor(){
		super();
		this.max_ammo = 10;
		this.ammo = 10;

		this.damage = 9;

		this.auto = false;	

		this.name = "pistol"
		
		this.max_uses = this.max_ammo;
		this.uses_left = this.ammo;

		this.reload_time = 4500;
		
	}


	apply_item(entities, self){	
		entities = super.create_candidates(entities, self)


		if(this.used || this.uses_left <= 0){
			return 
		}


		let first_in_sight = entities.filter(entity => {
			return entity.rotation_difference < 7 * Math.PI/180 
				&& entity.distance < entity.distance_to_wall_intersect
		}).sort((a, b) => a.distance - b.distance);


		if(first_in_sight.length > 0){
			first_in_sight = first_in_sight[0]


			first_in_sight.entity.health -= this.damage;

		}

		this.used = true
		this.uses_left -= 1;
		

	}

	clear_item(){
		this.used = false
	}
}

class ElectroHands extends Weapon{
	constructor(){ 
		super();

		this.name = "electrohands";

		this.uses_left = 3;
		this.max_uses = 3;
		this.reload_time = 10_000;
	}
}

class HealItem extends Item{
	constructor(){
		super();
		this.name = "heal"

		this.uses_left = 1;
		this.max_uses = 1;

		this.reload_time = 15_000
	}


	apply_item(entities, self){	
		if(this.used || self.health == self.max_health || this.uses_left <= 0){
			return
		}

		
		self.health += 20;

		this.used = true;

		this.uses_left -= 1;
	}


	clear_item(){
		
		this.used = false;
	}
}

module.exports = {
	Pistol,
	HealItem
}
