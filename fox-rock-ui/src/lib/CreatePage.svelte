<script>
    import { onMount } from "svelte";


import { default_server_url } from "../state/config.svelte";
import { connection } from "../state/connection.svelte";


import MapPreview from "./MapPreview.svelte";
import CreateMapPage from "./CreateMapPage.svelte";

let props = $props();

//the funciton to change the decide mode, when the server is crated we want to change to play mode
let decide_mode = props.decide_mode;


//server id to show that is the actual server id
let created_server_id = $state("");

//proposed server id, might be used up
let server_id = $state("");


function create_server(){
	
	//check that server name is not empty
	if(server_id == ""){
		alert("please give the server an id")
		return 

	}
	

	//request to server to create a room with id server_id
	fetch(default_server_url, {
		method : "POST", 
		body : JSON.stringify({
			maybe_id : server_id,
			//the map can either be community or self made else the server will use the default map
			map_info : (include_map || chosen_map !== undefined) ? {
				map,
				map_size : map_size/8
			}
				: undefined
		}),
		headers : {
			"content-type" : "application/json",
		}
	}).then(res => res.json()).then(res => {
		//check if response is successfull
		if(res.success){
			
			//if the server id is not taken already we can join this
			if(res.group_id == server_id){
				alert("created server with id: " + res.group_id)
				created_server_id = res.group_id;	
				connect()
			}else{	
				//else we create a unique identifier and connect to it
				alert("unfortunately your serverid is taken! created server with id: " + res.group_id)
				created_server_id = res.group_id;	
				connect()
			}

		}

	})

}

//toggle to include own map or not
let include_map = $state(false);


//map size (needs to be multiple of 8)
let map_size = $state(8)

//provide some handle for the map returned frm the mapcreator
let map = $state();

function connect(){	
	//change the mode to "play" and set the server id to use in playing later
	connection.set(created_server_id)

	decide_mode("play")
}

console.log(default_server_url)

let community_maps = $state([])
let chosen_map = $state()
onMount(async () => {
		
	//get all maps from online database JSONbin	
	let all_map_record = await fetch("https://api.jsonbin.io/v3/b/676538edad19ca34f8de392a/latest", {
		method : "GET",
		headers : {
			"X-Access-Key" : "$2a$10$8XyWRHsCr1WHkjqpZPrnaOfRx5y8LFwIdYJZiwmiamWofr8/4FRo6"
		}
	}).then(res => res.json())

	community_maps = all_map_record.record.maps
})

function use_community_map(index){
	//mark the clicked name to be the currently used one
	chosen_map = index

	//get the clicked map from the commuinty map by index
	let clicked_map = community_maps[index]
	map = clicked_map.map;
	map_size = clicked_map.map_size

	console.log(map, map_size)
}

</script>

<style>

.link{
	text-decoration: underline;
	color : blue;
	background-color: none;
	border : none;

}

.container{
	height : 100vh;

	display: flex;
	flex-direction: column;
	align-items: center;

	.server-name{
		padding : 20px;
		> * {
			font-size: 2em;
		}
	}
}

</style>

<div class="container">


	
			


	<div class="server-name">
			<input type="text" placeholder="proposed server id?" bind:value={server_id}>
			<button onclick={create_server}>Create Server + Play</button>
		</div>

		<div class="server-name">	
			<div>
				Include own Map<input type="checkbox" bind:checked={include_map}> 
			</div> 
				
		</div>
	
		
		{#if include_map}
			<CreateMapPage bind:received_maps={community_maps} bind:map_size={map_size} bind:definitive_map={map}></CreateMapPage>
		

		{:else}
		

	<hr>

	<h1>Community Pages</h1>

	{#if community_maps.length > 0}
		<ul>
		{#each community_maps as map, index}
			<div onclick={() => use_community_map(index)} style="background-color: {index == chosen_map ? 'red' : 'transparent'}">
				<h3>{map.map_name}</h3>


				<div><MapPreview preview={map.map}></MapPreview></div>	
			</div>		
			
			<hr style="height:1px;background-color:black;">
		{/each}

	</ul>

	<br>

	{:else}
		<div>Loading Community Maps</div>
	{/if}
	

	{/if}
		

	
	
</div>
