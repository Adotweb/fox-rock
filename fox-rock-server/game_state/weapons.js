class Weapon{
	constructor(){
		this.damage = 1;
		
		this.auto = false;
		
		this.triggered = false;

		this.max_ammo = 1;
		this.current_ammo = 1;
	}

	//returns wheter or not we have actually shot
	//if we have shot (i.e. the weapon is not untriggarable) we return the amount of damage were dealing
	get_damage_on_trigger(){
		if(this.current_ammo == 0 || (this.triggered && !this.auto)){
			//0 damage dealt when this weapon cannot fire anymore
			return 0
		}		

		this.current_ammo -= 1;

		this.triggered = true

		return this.damage
	}

	release_trigger(){
		this.triggered = false;
	}
}


class Pistol extends Weapon{
	constructor(){
		super();

		this.damage = 9;

		this.max_ammo = 10000;
		this.current_ammo = this.max_ammo;
	}
}

module.exports = {
	Pistol
}
