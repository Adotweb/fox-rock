import { writable } from "svelte/store";

//not frequently changing variables to which we need access from everywhere
export const global_state = writable({
	chunk_offset : [0, 0],
	chunk_w : 8,
	chunk_h : 8, 
	world_map : [[]],
	
	player_pos : [0, 0],
	player_rot : 0,
	chunk_pos : [0, 0],
	chunk_coords : [0, 0]
})
