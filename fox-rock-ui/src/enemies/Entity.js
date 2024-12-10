export class Entity {
	constructor(start_pos, start_rot, speed){
		this.pos = start_pos;
		this.rot = start_rot;
		this.speed = speed;
		this.depth = 0;
		this.type = "entity"
		this.id = crypto.randomUUID();
		this.name = "entity"
	}


	update(update_info){

	}

	get_world_info(){
		return {
			pos : this.pos,
			rot : this.rot
		}
	}


	register_to(entity_list){
		entity_list.push(this)
	}

	render(ctx, mini_map_ctx){

	}
}
