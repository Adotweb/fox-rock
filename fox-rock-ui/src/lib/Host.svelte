<script>
import Peer from "peerjs";
import { onMount } from "svelte";





let host_peer;

let host_id = $state("");


let connections = new Map();

let connection_ids = $state([])

let default_chunk = [
	1, 1, 1, 0, 0, 1, 1, 1,
	1, 0, 0, 0, 0, 0, 0, 1, 
	1, 0, 0, 0, 0, 0, 0, 1, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	1, 0, 0, 0, 0, 0, 0, 1, 
	1, 0, 0, 0, 0, 0, 0, 1, 
	1, 1, 1, 0, 0, 1, 1, 1, 
]

let chunk_offset = [50, 50];
let world_map = Array.from({length : 100}, () => new Array(100).fill(default_chunk));

onMount(() => {

	host_peer = new Peer();
	

	host_peer.on("open", id => {
		host_id = id;
	})

	host_peer.on("connection", conn => {
		console.log("hello something tries to connect")

		conn.on("open", id => {

			console.log("hello")		

		})
		
	})

})

</script>


<div>


	<div>Host id:</div>	<br>
	<div>{host_id}</div>

	<div>
		<p>
			active connections
		</p>
	
		<ul>
			{#each connection_ids as conn}
				<li>{conn}</li>						
			{/each}
		</ul>
	</div>

</div>
