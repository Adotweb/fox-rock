import { Entity } from "./Entity"

	
export class Ghoul extends Entity {

	constructor(start_pos, start_rot, speed){
		super(start_pos, start_rot, speed)

		this.name = "ghoul"	

		this.pos = start_pos || [0, 0];
			
		this.rot = start_rot || 0;

		this.rel_pos = [0, 0];

		this.speed = 1
		this.depth = 0;

		this.image = new Image();

		this.src = "/public/ghoul.png"
	}

	//same as in bullet but here also check for collisions in 
	update(update_info){

		let { player_pos, player_rot_trig } = update_info;
		
		let [csx, snx] = player_rot_trig

		let direction_to_player = [
			player_pos[0] - this.pos[0],
			player_pos[1] - this.pos[1]
		]


		let direction_mag = Math.sqrt(direction_to_player[0]**2 + direction_to_player[1]**2)


		if(direction_mag < 0.5){
			this.delete()
		}
	

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
	
		other_entities.forEach(entity => {
			if(entity.id == this.id){
				return
			}

			let distance = (this.pos[0] - entity.pos[0])**2 + (this.pos[1] - entity.pos[1])**2
			if(entity.name == "bullet"){
				if(distance < 0.5){
					this.delete()
					entity.delete()
				}		
			}	

		})
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

		ctx.fillStyle = "green"
		ctx.fill()

		
	}
}
