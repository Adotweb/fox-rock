<script>
let props = $props();

let decide_mode = props.decide_mode;


import Peer from 'peerjs';
import { onMount } from 'svelte';
import { connection } from "../state/connection.svelte"
import { get } from 'svelte/store';
import App from '../App.svelte';

let peer;
let this_peer_id = $state("")

let host_peer_id;
let host_connection



onMount(() => {
	//Create peer connection
	peer = new Peer();

	
	peer.on("connection", conn => {
		conn.on("data", data => {
		})
	})

})


function connect_to_host_peer(){
	console.log(host_peer_id)
	host_connection = peer.connect(host_peer_id)


	host_connection.on("open", () => {
		
		console.log("Hello")

	})

}


</script>


<div>
	<input type="text" bind:value={host_peer_id} placeholder="Host Id">	
	<div>this peer id: {this_peer_id}</div>
	<button onclick={connect_to_host_peer}>Connect</button>
	
</div>
