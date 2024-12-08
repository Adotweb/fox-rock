function create_player_state(pos){

	let positions = pos;

	function get(){
		return positions;
	}

	function set(update){
		positions = update(positions)
	}

	return [get, set];

}

function create_chunk_state(map_size){
	
	let chunks = Array.from({ length: map_size }, () => new Array(map_size).fill(false));
	
	function update(fn){
		chunks = fn(chunks)	
	}

	function get(){
		return chunks
	}


	return [get, update]
}

export let player_state = create_player_state({
	player_pos : [2, 2],
	chunk_pos : [0, 0],
	chunks_coords : [2, 2],
	offset : [50, 50]
});


export let chunk_state = create_chunk_state(100);
