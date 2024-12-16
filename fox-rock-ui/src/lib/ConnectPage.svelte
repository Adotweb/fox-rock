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

</script>


<div>

	<input type="text" bind:value={server_id}>

	<button onclick={connect}>Connect</button>

</div>
