class Item{
	constructor(){
		this.used = false;

		this.spammable = false;
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
		if(this.used){
			return 
		}


		let first_in_sight = entities.filter((entity) => entity.rotation_difference < 7 * Math.PI/180).sort((a, b) => a.distance - b.distance)[0];
		
		console.log(first_in_sight)
		

	}

	clear_item(){
		this.used = false
	}
}

module.exports = {
	Pistol
}
