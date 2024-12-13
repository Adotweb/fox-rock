//unlike in the enemies folder everything inside of here is just for the sake of rendering,
//there is no logic in these entities as everything in that regard is handled serverside (in this version at least)


let w = 800;
let h = 800;

let mini_map_w = 300;
let mimi_map_h = 300;

class RenderEntity{
	constructor(position, player_position, player_rotation){
		this.position = position;

		let player_relative_position = [
			this.position[0] - player_position[0],
			this.position[1] - player_position[1]
		]

		this.rel_pos = [
			(player_relative_position[0] * Math.cos(player_rotation) + player_relative_position[1] * Math.sin(player_rotation)),
			(-player_relative_position[0] * Math.sin(player_rotation) + player_relative_position[1] * Math.cos(player_rotation)),
		]	

		this.type = "entity"
		this.color = "black"
		this.depth = Infinity;
		
		if(this.rel_pos[1] > 0){
			this.depth = this.rel_pos[1]
		}
	}


	render(screen, mini_map){

		let mmw = 300;
		let mmh = 300;

		mini_map.beginPath();
	
		let mini_map_x = mmw/2 + mmw/2 * this.rel_pos[0]/10;
		let mini_map_y = mmh/2 - mmh/2 * this.rel_pos[1]/10;
		

		mini_map.beginPath();
		mini_map.arc(mini_map_x, mini_map_y, 5, 0, 2 * Math.PI)

		mini_map.fillStyle = "blue"
		mini_map.fill()



		if(this.rel_pos[1]  < 0){
			return
		}
		let sx = this.rel_pos[0]/this.rel_pos[1]

		screen.beginPath();
		screen.arc(sx * 400 + 400, 400, 100 * 1/this.rel_pos[1], 0, 2 * Math.PI)

		screen.fillStyle = "green"
		screen.fill()
	}
}


class Player extends RenderEntity{
	
}

export let entity_rendering_map ={
	"player" : Player
}
