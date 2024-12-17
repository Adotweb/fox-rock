<script>
//Client is the version that implements multiplayer and server side logic
import Client from "./lib/Client.svelte";
import ConnectPage from "./lib/ConnectPage.svelte";
import Popup from "./lib/Popup.svelte";
import CreatePage from "./lib/CreatePage.svelte";

//state to control the thing that is drawn to the screen
let mode = $state("menu")


//function thats passed in to toggle mode
function decide_mode(passed_mode){
	mode = passed_mode
}


</script>

<main>
	{#if mode == "menu"}	
		<Popup {decide_mode}></Popup>
	{/if}

	{#if mode == "connect"}	
		<ConnectPage {decide_mode}></ConnectPage>
	{/if}

	{#if mode == "play"}	
		<Client {decide_mode}></Client>
	{/if}

	{#if mode == "create"}
		<CreatePage {decide_mode}></CreatePage>	
	{/if}

</main>
