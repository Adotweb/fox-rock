<script>

let { map_size = $bindable(16), definitive_map = $bindable(), ...props } = $props();

import {create_chunked_map} from "./helpers.svelte"

let map_id = crypto.randomUUID();



//this is going to be the main array were building the map in
let map = $state(new Array(map_size*map_size).fill(0).map((cell_state, index) => ({cell_state, index})));

$effect(() => {	
	//whenever the map size changes we need to redo the empty map array
	map = new Array(map_size*map_size).fill(0).map((cell_state, index) => ({cell_state, index}))

})

function mark_as_cell(index){
	//whenever a cell is clicked we negate the cell state that it already has
	//we "flip" the color
	map[index].cell_state = Number(!map[index].cell_state);

	//also we set the map for the compoennt above
	definitive_map = create_chunked_map(map);
}

//this saves the map under an id to a server of JSONbin
function save_map(){
	//first we create the chunked map	
	let chunked_map = create_chunked_map(map)

}
</script>

<style>
.map-creator-container{
	background-color: white;
	width:min(100vh, 800px);

	height: max-content;
	padding: 20px;

	flex : 1;

	display: grid;

	> * {
		border: 1px solid #808080;
		background-color: white;
	}

	.wall-cell{
		background-color: red;
	}

	
}

</style>

<button onclick={save_map} style="font-size:1em">Save Map as <strong>{map_id}</strong> <br>(this makes the map browsable!)</button>
<div class="map-creator-container" style="
	grid-template-rows: repeat({map_size}, 1fr);
	grid-template-columns: repeat({map_size}, 1fr)">
	{#each map as cell}
		<div onclick={() => mark_as_cell(cell.index)} style="background-color: {cell.cell_state == 1 ? 'red' : 'white'}"></div>	
	{/each}		


</div>
