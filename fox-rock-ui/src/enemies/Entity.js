export class Entity {
	constructor(start_pos, start_rot, speed){
		this.pos = start_pos;
		this.rot = start_rot;
		this.speed = speed;
	}


	update(update_info){

	}

	get_world_info(){
		return {
			pos : this.pos,
			rot : this.rot
		}
	}
}
