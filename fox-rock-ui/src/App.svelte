<script>

//render is the purely client side version
import ClientSideGame from "./lib/ClientSideGame.svelte"


import HUD from "./lib/HUD.svelte"

//Client is the version that implements multiplayer and server side logic
import Client from "./lib/Client.svelte";

</script>

<main>
	<Client></Client>
</main>
