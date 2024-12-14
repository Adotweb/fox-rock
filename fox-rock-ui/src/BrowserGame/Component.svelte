<script>
import { entity_state } from "./state/entity-state.svelte"


import { screen_width, screen_height, mini_map_width, mini_map_height } from "./rendering/render.svelte"

//the handles for screen and mini map for easier rendering
let screen;
let mini_map;


</script>


<canvas bind:this={mini_map} width={mini_map_width} height={mini_map_height}></canvas>


<canvas bind:this={screen} width={screen_width} height={screen_height}></canvas>
