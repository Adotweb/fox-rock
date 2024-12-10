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

export function EntityList(){

	let list = [];


	function update_entity_state(update_info, render_order){
		list.forEach(entity => {	
			entity.update({...update_info, other_entities : list})
			render_order = insertIntoSortedArray(render_order, {
				data : entity,
				...entity
			})
		})	

	}

	function register_entity(entity){
		entity.register_to(list)
	}

	function register_entity_list(entity_list){
		entity_list.forEach(entity => {
			entity.register_to(list)
		})
	}

	function get_entity_list(){
		return list
	}


	return {
		update_entity_state, 
		get_entity_list, 
		register_entity, 
		register_entity_list
	}
}


