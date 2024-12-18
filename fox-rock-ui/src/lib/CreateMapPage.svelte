<script>

let map_size = 32
//this is going to be the main array were building the map in
let map = $state(Array.from({length : map_size**2}, () => 0).map((cell_state, index) => ({cell_state, index})))


function mark_as_cell(index){

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
		<div onclick={() => mark_as_cell(cell.index)}></div>	
	{/each}		
</div>
