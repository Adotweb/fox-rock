export class Entity {
	constructor(start_pos, start_rot, speed){
		this.pos = start_pos;
		this.rot = start_rot;
		this.speed = speed;
		this.depth = 0;
		this.type = "entity"
	}


	update(update_info){

	}

	get_world_info(){
		return {
			pos : this.pos,
			rot : this.rot
		}
	}


	render(ctx, mini_map_ctx){

	}
}
