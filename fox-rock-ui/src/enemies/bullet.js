import { Entity } from "./Entity";

export class Bullet extends Entity{
	constructor(start_pos, direction){
		super(start_pos, 0, 0)

		this.speed = 2;
		this.name = "bullet"	
		//direction is in csx and snx of the players current rotation
		this.direction = direction
	}


	update(update_info){	
		let { player_pos, player_rot_trig, map_data } = update_info;
		
		let [csx, snx] = player_rot_trig

		let direction_to_player = [
			player_pos[0] - this.pos[0],
			player_pos[1] - this.pos[1]
		]


		let direction_mag = Math.sqrt(direction_to_player[0]**2 + direction_to_player[1]**2)

		this.pos = [
			this.pos[0] - this.direction[1] * this.speed/100,
			this.pos[1] + this.direction[0] * this.speed/100,
		]

		let chunk_coords = [
			Math.floor(this.pos[0]/8) + 50,
			Math.floor(this.pos[1]/8) + 50
		]

		let in_chunk_coords = [
			this.pos[0] % 8, 
			this.pos[1] % 8
		]

		let chunk = map_data[chunk_coords[0]][chunk_coords[1]];

		let index = Math.floor(in_chunk_coords[1]) * 8 + Math.floor(in_chunk_coords[0])

		if(chunk[index] == 1){
			this.delete()
		}
	
		this.rel_pos = [
			direction_to_player[0] * csx + direction_to_player[1] * snx,
			direction_to_player[0] * -snx + direction_to_player[1] * csx,
		]


		this.depth = -this.rel_pos[1];

	}


	render(ctx){

		
		let sx = this.rel_pos[0]/this.rel_pos[1];


		if(this.rel_pos[1] > 0){
			return
		}

		ctx.beginPath();
		ctx.arc(sx * 400 + 400, 400, 100 * 1/-this.rel_pos[1] * 0.2, 0, 2 * Math.PI)

		ctx.fillStyle = "blue"
		ctx.fill()

	}
}
