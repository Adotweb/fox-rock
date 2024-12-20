import { mini_map_h, mini_map_w, screen_h, screen_w } from "../../state/config.svelte"

//unlike in the enemies folder everything inside of here is just for the sake of rendering,
//there is no logic in these entities as everything in that regard is handled serverside (in this version at least)
class RenderEntity{
	constructor(position, player_position, player_rotation){

		//one could inquire that we could update an entity instead of creatin new ones every frame, 
		//which is true, but i dont care
		this.position = position;


		//this has to be done every frame as well
		//by now we know the drill, get the relative position to the player
		let player_relative_position = [
			this.position[0] - player_position[0],
			this.position[1] - player_position[1]
		]
		
		//then get the relative position along the players z and x axis (camera rotation)
		//we basically just dot product the difference vector with the view direction vector
		this.rel_pos = [
			(player_relative_position[0] * Math.cos(player_rotation) + player_relative_position[1] * Math.sin(player_rotation)),
			(-player_relative_position[0] * Math.sin(player_rotation) + player_relative_position[1] * Math.cos(player_rotation)),
		]	


		//set the type (for entity filtering in render_edges) and color 
		this.type = "entity"
		this.color = "black"

		//put the entity at the very back by default
		this.depth = Infinity;
	
		//then check if the entity is in fron of the player, if yes, set the depth for sorting in painters algo
		if(this.rel_pos[1] > 0){
			this.depth = this.rel_pos[1]
		}
	}

	//every render entity has its own render method so we can implement rendering for every entity individually
	render(screen, mini_map){

	}
}

//dummy class (for now)
class Player extends RenderEntity{

	//we render other players as green orbs
	render(screen, mini_map){
		this.color = "green"
		//mini-map dimensions
		let mmw = mini_map_w;
		let mmh = mini_map_h;

		mini_map.beginPath();
		
		//the position on the mini-map
		let mini_map_x = mmw/2 + mmw/2 * this.rel_pos[0]/10;
		let mini_map_y = mmh/2 - mmh/2 * this.rel_pos[1]/10;
		

		//make a small circle on the mini-map where the entity is
		mini_map.beginPath();
		mini_map.arc(mini_map_x, mini_map_y, 5, 0, 2 * Math.PI)

		mini_map.fillStyle = "blue"
		mini_map.fill()



		//check if were in front of the player
		if(this.rel_pos[1]  < 0){
			return
		}

		//calculate the x coordinate on the screen	
		let sx = this.rel_pos[0]/this.rel_pos[1]


		//draw a green orb where the entity is relative to the player (with radious 1/distance) for accurate depth perception
		screen.beginPath();
		screen.arc(sx * screen_w/2 + screen_w/2, screen_h/2, 100 * 1/this.rel_pos[1], 0, 2 * Math.PI)

		screen.fillStyle = this.color 
		screen.fill()
	}

}


//export a map for easy discerning when converting entity information from the server to a RenderEntity
export let entity_rendering_map ={
	"player" : Player
}
