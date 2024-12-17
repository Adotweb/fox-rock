<script>
let props = $props();

let decide_mode = props.decide_mode;


import { onMount } from 'svelte';
import { connection } from "../state/connection.svelte"


let server_id;

	
//list of active servers
let server_list = $state([]);

onMount(() => {
	//get the list of active servers
	fetch("http://localhost:3000/get_rooms").then(res => res.json())
	.then(res => {
		server_list = res.rooms;	
	})
})

function choose_server(server_id){

	connection.set(server_id)

	decide_mode("play")
}

</script>


<div style="height:100vh;">
	<h1>List of active servers</h1>
	<ul>
		{#each server_list as server_id}
		{/each}
	</ul>
	
</div>
