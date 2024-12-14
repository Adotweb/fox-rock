export const chunk_w = 8;
export const chunk_h = 8;

export const chunk_offset = [50, 50]

export class Player{
	constructor(position){
		//the postiion inside of the world
		this.position = position || [2, 2]

		//the position of the current chunk the xth chunk from the left the yth chunk from the top
		//we add chunk offset so we can start in the middle of the 100x100 array of chunks and
		this.chunk_pos = [
			Math.floor(this.position[0]/chunk_w) + chunk_offset[0],
			Math.floor(this.position[1]/chunk_h) + chunk_offset[1]
		]
	
		//the position relative to the chunks [0, 0] coordinate
		this.chunk_coords = [
			this.position[0] % chunk_w,
			this.position[1] % chunk_h
		]


		this.rotation = 0 
		

		this.direction = [0, 0];
	}

	update_direction(direction){
		this.direction = direction;
	}

	move(){
		//calculate the "forward" direction regarding the rotation of the player
		let move_direction = [
			this.direction[0] * Math.cos(this.rotation) - this.direction[1] * Math.sin(this.rotation),
			this.direction[1] * Math.sin(this.rotation) + this.direction[1] * Math.cos(this.rotation),
		]

		//normalize the move_direction to 1

		let move_dir_mag = Math.sqrt(move_direction[0]**2 + move_direction[1]**2);

		move_direction = [
			move_direction[0]/move_dir_mag,
			move_direction[1]/move_dir_mag
		]
		
		this.position = [
			this.position[0] + move_direction[0], 
			this.position[1] + move_direction[1]
		]
	}
}
