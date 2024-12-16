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
	 peer = new Peer(crypto.randomUUID(), {
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }, // Google's free STUN server
        ]
    }
});

})


function connect_to_host_peer(){
	//connects to host id 
	host_connection = peer.connect(host_peer_id)

	//when the host id accepts the handshake we move save the host_connection and move on to the game play part
	host_connection.on("open", () => {	
		connection.set(host_connection)
		decide_mode("play")				
	})
}


</script>


<div>
	<input type="text" bind:value={host_peer_id} placeholder="Host Id">	
	<div>this peer id: {this_peer_id}</div>
	<button onclick={connect_to_host_peer}>Connect</button>
	
</div>
