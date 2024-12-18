class Item{
	constructor(){
		this.used = false;

		this.spammable = false;
	}

	create_candidates(entities, self){
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
		
			let distance = Math.sqrt(dir_to_entity[0]**2 + dir_to_entity[1]**2)	
			candidates.push({distance, entity, rotation_difference})
		})
		return candidates
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
		this.max_ammo = 1000;
		this.ammo = 1000;

		this.damage = 9;

		this.auto = false;	
	}


	apply_item(entities, self){	
		
		entities = super.create_candidates(entities, self)

		if(this.used){
			return 
		}


		let first_in_sight = entities.filter((entity) => entity.rotation_difference < 7 * Math.PI/180).sort((a, b) => a.distance - b.distance);

		if(first_in_sight.length > 0){
			first_in_sight = first_in_sight[0]


			first_in_sight.entity.health -= this.damage;

		}

	
		this.used = true
	}

	clear_item(){
		this.used = false
	}
}

class HealItem extends Item{
	constructor(){
		super();
	}


	apply_item(entities, self){	
		if(this.used){
			return
		}


		self.health += 20;

		this.used = true;
	}


	clear_item(){
		
		this.used = false;
	}
}

module.exports = {
	Pistol,
	HealItem
}
