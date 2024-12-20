<script>

let { map_size = $bindable(16), definitive_map = $bindable(), received_maps = $bindable(), ...props } = $props();



import {create_chunked_map} from "./helpers.svelte"

//in case there is no map_name provided
let map_id = $state(crypto.randomUUID());

//the map name when we want to save it as community map
let map_name = $state();

//this is going to be the main array were building the map in
let map = $state(new Array(map_size*map_size).fill(0).map((cell_state, index) => ({cell_state, index})));

$effect(() => {	
	//whenever the map size changes we need to redo the empty map array
	map = new Array(map_size*map_size).fill(0).map((cell_state, index) => ({cell_state, index}))

})


//this stuff is for when the mouse is held
let mouse_held = false;

//for some reason - and i have no explanation why that is - holding down doesnt work when trying to delete cells
//adding them works just fine (except for when you failed to delete by holding just before)
//and clicking also works
//this problem could not be resolved by any efforts
function mark_as_cell(index){

	if(!mouse_held){
		return
	}
	flip_cell(index)
}


//this is to flip singular cells
function flip_cell(index){
	//whenever a cell is clicked we negate the cell state that it already has
	//we "flip" the color
	map[index].cell_state = Number(!map[index].cell_state);

	//also we set the map for the compoennt above
	definitive_map = create_chunked_map([...map]);
}

//this saves the map under an id to a server of JSONbin
async function save_map(){
	//first we create the chunked map	

	if(!map){
		alert("please dont waste memory")
		return
	}

	let chunked_map = create_chunked_map(map)

	let saved_map = await fetch("https://api.jsonbin.io/v3/b", {
		method : "POST",
		headers : {
			"Content-Type" : "application/json",
			"X-Access-Key": "$2a$10$8XyWRHsCr1WHkjqpZPrnaOfRx5y8LFwIdYJZiwmiamWofr8/4FRo6"
		}, 
		body : JSON.stringify({
			map : chunked_map,
			map_name : map_name || map_id,
			map_size
		})
	}).then(res => res.json())

	let saved_map_id = saved_map.metadata.id;

	let new_all_maps = {
		maps : [
			...received_maps,
			{
				map : chunked_map, 
				map_id : saved_map_id,
				map_name : map_name || map_id,
				map_size
			}
		]
	}	
	
	//then save new all maps array to the central bin
	let new_all_map_record = await fetch("https://api.jsonbin.io/v3/b/676538edad19ca34f8de392a", {
		method : "PUT",
		headers : {
			"X-Access-Key" : "$2a$10$8XyWRHsCr1WHkjqpZPrnaOfRx5y8LFwIdYJZiwmiamWofr8/4FRo6",
			"Content-Type" : "application/json"
		},
		body : JSON.stringify(new_all_maps)
	}).then(res => res.json())


	//after we successfully saved we give feed back to the player and reload the page


	alert(`your mape ${map_name || map_id} was successfully saved as a community map`)

}
</script>

<style>
.map-creator-container{
	background-color: white;
	width:min(100vh, 800px);

	height: max-content;
	padding: 20px;
	
	aspect-ratio: 1;

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

<svelte:window onmousedown={() => mouse_held = true} onmouseup={() => mouse_held = false}></svelte:window>

<div>Map Name? <input type="text" bind:value={map_name}></div>

<br>

<div>
	Map Size <input type="number" step="8" bind:value={map_size}>
</div>

<br>

<button onclick={save_map} style="font-size:1em">Save Map as <strong>{map_name || map_id}</strong> <br>(not needed, you can play the map without saving)</button>

<div class="map-creator-container" style="
	grid-template-rows: repeat({map_size}, 1fr);
	grid-template-columns: repeat({map_size}, 1fr)">
	{#each map as cell}
		<div onmousedown={() => flip_cell(cell.index)} onmouseover={() => mark_as_cell(cell.index)} style="background-color: {cell.cell_state == 1 ? 'red' : 'white'}"></div>	
	{/each}		


</div>
