import { Entity } from "./Entity";

export class Zombie extends Entity{
	constructor(start_pos){
		super(start_pos, 0, 0);
		this.name = "zombie"
	}

	update(update_info){

		let { player_pos, player_rot_trig } = update_info;
		
		let [csx, snx] = player_rot_trig

		let direction_to_player = [
			player_pos[0] - this.pos[0],
			player_pos[1] - this.pos[1]
		]


		let direction_mag = Math.sqrt(direction_to_player[0]**2 + direction_to_player[1]**2)

	

		let pos = [
			this.pos[0] + direction_to_player[0]/direction_mag/100 * this.speed,
			this.pos[1] + direction_to_player[1]/direction_mag/100 * this.speed
		]

		this.rel_pos = [
			direction_to_player[0] * csx + direction_to_player[1] * snx,
			direction_to_player[0] * -snx + direction_to_player[1] * csx,
		]


		this.depth = -this.rel_pos[1];

		//other_entities can be used to compute distances and relationships to other entities (collision for example)
		let { other_entities } = update_info;
	}

	render(ctx, mini_map_ctx){
		let sx = this.rel_pos[0]/this.rel_pos[1];
	
		let mmw = 300;
		let mmh = 300;

		mini_map_ctx.beginPath();
	
		let mini_map_x = mmw/2 - mmw/2 * this.rel_pos[0]/10;
		let mini_map_y = mmh/2 + mmh/2 * this.rel_pos[1]/10;


		mini_map_ctx.beginPath();
		mini_map_ctx.arc(mini_map_x, mini_map_y, 5, 0, 2 * Math.PI)

		mini_map_ctx.fillStyle = "black"
		mini_map_ctx.fill()



		if(this.rel_pos[1] > 0){
			return
		}

		ctx.beginPath();
		ctx.arc(sx * 400 + 400, 400, 100 * 1/-this.rel_pos[1], 0, 2 * Math.PI)

		ctx.fillStyle = "blue"
		ctx.fill()
	}
}
