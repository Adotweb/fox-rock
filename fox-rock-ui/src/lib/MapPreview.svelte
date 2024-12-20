<script>
    import { onMount } from "svelte";

//this component is just a small window of the map
let props = $props();
let preview = props.preview;

let flat_map = $state();
let map_size = $state();

onMount(() => {
	let chunk_amount = preview.length;	


	map_size = chunk_amount * 8;

	flat_map = Array.from({length : map_size ** 2}, () => 1)

	preview.forEach((chunk_row, chunk_index) => {
		chunk_row.forEach((chunk, chunk_row_index) => {

			chunk.forEach((cell, cell_index) => {
				//the number of cells on the newest line inside the chunk
                		let in_chunk_x = cell_index % 8; 
				//the number of full lines in the newest chunk
                		let in_chunk_y = Math.floor(cell_index / 8); 

				//these are the amounts of whole chunks so far
                		let chunk_offset_y = chunk_row_index * 8;
                		let chunk_offset_x = chunk_index * 8;

				//add them together to get the position in the flat array by x, y
                		let final_x = chunk_offset_y + in_chunk_y; 
                		let final_y = chunk_offset_x + in_chunk_x; 
				
				// multiply y with square side + x to get the flat index
				//also 1 - x for the x coordinate to flip along the vertical axis
                		let flat_index = final_y * map_size + (map_size - final_x - 1);
                		flat_map[flat_index] = cell; 
			})

		})
	})
})

</script>


<style>

.map-preview{
	aspect-ratio: 1;
	width : 600px;
	
	display: grid;

	> div{
		border : 1px solid black;
	}
}

</style>

<div class="map-preview" style="grid-template-rows:repeat({map_size}, 1fr);grid-template-columns:repeat({map_size}, 1fr)">

	{#each flat_map as cell}
		<div style="background-color:{cell ? 'red' : 'white'}"></div>
	{/each}	

</div>

