import { Ghoul } from "../enemies/ghoul";


function insertIntoSortedArray(sortedArray, value) {
        let left = 0;
        let right = sortedArray.length - 1;

        // Perform binary search to find the insertion point
        while (left <= right) {
                const mid = Math.floor((left + right) / 2);
                if (sortedArray[mid].depth === value.depth) {
                        // If the value already exists, insert it at the same position
                        left = mid;
                        break;
                } else if (sortedArray[mid].depth <= value.depth) {
                        left = mid + 1;
                } else {
                        right = mid - 1;
                }
        }

        // Insert the value at the found position2
        sortedArray.splice(left, 0, value);
        return sortedArray;
}


function create_player_state(pos){

	let positions = pos;

	function get(){
		return positions;
	}

	function set(update){
		update(positions)
	}

	return [get, set];

}

function create_chunk_state(map_size){
	
	let chunks = Array.from({ length: map_size }, () => new Array(map_size).fill(false));
	
	function update(fn){
		fn(chunks)

	}

	function get(){
		return chunks
	}


	return [get, update]
}

function create_entity_state(entities_init){

	let entities = entities_init

	function update(update_info, render_order){


		entities_init.forEach(entity => {
			entity.update(update_info)
			render_order = insertIntoSortedArray(render_order, {
				data : entity,
				...entity
			})
		})
		
	}

	function get(){
		return entities
	}

	return [get, update]
}

export let player_state = create_player_state({
	player_pos : [2, 2],
	chunk_pos : [0, 0],
	chunks_coords : [2, 2],
	offset : [50, 50],
	rotation : 0
});


export let chunk_state = create_chunk_state(100);


export let entity_state = create_entity_state([
	new Ghoul([0, 0], 0, 0.1)
]);
