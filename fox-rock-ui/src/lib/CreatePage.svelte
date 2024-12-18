<script>

import { default_server_url } from "../state/config.svelte";
import { connection } from "../state/connection.svelte";

import CreateMapPage from "./CreateMapPage.svelte";

let props = $props();

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
	fetch("http://localhost:3000/create_room", {
		method : "POST", 
		body : JSON.stringify({
			maybe_id : server_id
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
			}else{	
				//else we create a unique identifier and connect to it
				alert("unfortunately your serverid is taken! created server with id: " + res.group_id)
				created_server_id = res.group_id;	
			}

		}

	})
}

let include_map;
let map_size = 0;

function connect(){	
	//change the mode to "play" and set the server id to use in playing later
	connection.set(created_server_id)

	decide_mode("play")
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


	{#if created_server_id}
	
		<div>Go to play on you server <button class="link" onclick={connect}>{created_server_id}</button></div>	

	{:else}
		<div class="server-name">
			<input type="text" placeholder="proposed server id?" bind:value={server_id}>
			<button onclick={create_server}>Create Server</button>
		</div>

		<div class="server-name">	
			<div>
				Include own Map<input type="checkbox" bind:checked={include_map}> 
			</div> 
		</div>

		
		<CreateMapPage ></CreateMapPage>

	{/if}
</div>
