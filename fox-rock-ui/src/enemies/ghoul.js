import { Entity } from "./Entity"

	
export class Ghoul extends Entity {
	super(start_pos, start_rot, speed){
		this.pos = start_pos || [0, 0];
	
		this.rot = start_rot || 0;

		this.speed = speed
	}

	update(update_info){

		let { player_pos } = update_info;

		let direction_to_player = [
			player_pos[0] - this.pos[0],
			player_pos[1] - this.pos[1]
		]
	
		this.pos = [
			this.pos[0] + direction_to_player[0] * this.speed,
			this.pos[1] + direction_to_player[1] * this.speed
		]	

		console.log(this.pos, player_pos)
	}
}
