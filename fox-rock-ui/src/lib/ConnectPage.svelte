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
	fetch("https://localhost-njg5.onrender.com/get_rooms").then(res => res.json())
	.then(res => {
		console.log(res.rooms)
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
			<a onclick={() => choose_server(server_id)}>{server_id}</a>
		{/each}
	</ul>
	
</div>
