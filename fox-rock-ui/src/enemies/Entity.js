export class Entity {
	constructor(start_pos, start_rot, speed){
		this.pos = start_pos;
		this.rot = start_rot;
		this.speed = speed;
		this.depth = 0;
		this.type = "entity"
		this.id = crypto.randomUUID();
		this.name = "entity"
		this.entity_list = this.entity_list
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
		this.entity_list = entity_list;
		entity_list.push(this)
	}

	delete(){
		const index = this.entity_list.findIndex(item => item.id == this.id);
		if(index !== -1){
			this.entity_list.splice(index, 1)
		}
	}

	render(ctx, mini_map_ctx){

	}
}
