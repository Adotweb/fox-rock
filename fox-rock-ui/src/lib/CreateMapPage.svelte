<script>

let map_size = 32;

//this is going to be the main array were building the map in
let map_array = new Array(map_size**2).fill(0).map((cell_state, index) => ({cell_state, index}))
let map = $state(map_array);

function mark_as_cell(index){
	
	map[index].cell_state = Number(!map[index].cell_state);
	
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

<div class="map-creator-container" style="
	grid-template-rows: repeat({map_size}, 1fr);
	grid-template-columns: repeat({map_size}, 1fr)">
	{#each map as cell}
		<div onclick={() => mark_as_cell(cell.index)} style="background-color: {cell.cell_state == 1 ? 'red' : 'white'}"></div>	
	{/each}		
</div>
