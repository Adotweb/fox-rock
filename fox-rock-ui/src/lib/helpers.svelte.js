
export function create_chunked_map(map){

	
	let map_side_length = Math.sqrt(map.length)


	//throw an error to the user when the map size is not nicely chunkable (i.e a multiple of 8)
	if(Math.floor(map_side_length/8) != map_side_length/8){
		alert("map size needs to be multiple of 8!")
		return;
	}

	//we create empty chunks of 8 by 8

	let chunked_map = Array.from({ length : map_side_length/8 }, () => new Array(map_side_length/8).fill(
		Array.from({length : 8}, () => new Array(8).fill(0))
	))

	map.forEach(({cell_state, index}) => {

		//the amount of cells to the right modulues of 8
		let x_index = index % map_side_length		

		//the amount of full rows already completed
		let y_index = Math.floor(index/map_side_length)


		//the position of the chunk in the map
		let chunk_pos = [
			Math.floor(x_index/8),
			Math.floor(y_index/8)
		]


		//the position of the current cell in the chunk
		let chunk_coords = [
			x_index % 8,
			y_index % 8
		]
		
		//this is just changing the chunked_maps cell state to the one from the flat array
		chunked_map[chunk_pos[0]][chunk_pos[1]][chunk_coords[1]][chunk_coords[0]] = cell_state
	})

	return chunked_map
}


