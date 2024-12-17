<script>
let props = $props();

let decide_mode = props.decide_mode;


import Peer from 'peerjs';
import { onMount } from 'svelte';
import { connection } from "../state/connection.svelte"
import { get } from 'svelte/store';
import App from '../App.svelte';

let peer;

let server_id;

function connect(){
	
}

let server_list = $state([]);
onMount(() => {

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


<div>

	

	<input type="text" bind:value={server_id}>
		
	{#each server_list as server_id}
		<button onclick={() => choose_server(server_id)}>{server_id}</button>	
	{/each}	
</div>
