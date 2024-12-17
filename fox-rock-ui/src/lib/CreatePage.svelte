<script>
let props = $props();

let decide_mode = props.decide_mode;

        import { default_server_url } from "../state/config.svelte";
        import { connection } from "../state/connection.svelte";


let created_server_id = $state("");

let server_name = $state("");

function create_server(){

	if(server_name == ""){
		alert("please give the server a name")
		return 

	}

	fetch("http://localhost:3000/create_room", {
		method : "POST", 
		body : JSON.stringify({
			maybe_id : server_name
		}),
		headers : {
			"content-type" : "application/json",
		}
	}).then(res => res.json()).then(res => {
		console.log(res)
		if(res.success){

			if(res.group_id == server_name){
				alert("created server with id: " + res.path)
				created_server_id = res.group_id;	
			}else{	
				alert("unfortunately your serverid is taken! created server with id: " + res.group_id)
				created_server_id = res.group_id;	
			}

		}

	})
}



function connect(){
	console.log(default_server_url + created_server_id)		
	
	connection.set(created_server_id)

	decide_mode("play")
}

</script>

<style>

.link{
	text-decoration: underline;
	color : blue;
}

</style>

<div>
	<input type="text" placeholder="server name?" bind:value={server_name}>

	
	{#if created_server_id}
	
		<div>Go to play on you server <button class="link" onclick={connect}>{created_server_id}</button></div>	

	{:else}
		<button onclick={create_server}>Create Server</button>
	{/if}
</div>
