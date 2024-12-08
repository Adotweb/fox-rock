<script>

import { chunk_state, player_state } from "../state/game_state.js"

let [get_chunks] = chunk_state;

let [get_player_pos] = player_state;

let menu_toggled = false;

let map_element;
let map_data;


let map_elements = $state("");

function open_menu(){

	let {offset, chunk_pos} = get_player_pos()	
	
	console.log(chunk_pos)
	map_elements = map_data.map((row, y) => {
		return row.map((chunk, x) => {
		
						
			if(y == offset[0] + chunk_pos[0] && x == offset[1] + chunk_pos[1]){
				return `<div style="background-color:blue"></div>`
			}

			return `<div style="background-color:${chunk? 'red' : 'white'};border:1px solid black;"></div>`
		}).join("")
	}).join("")


	map_element.style.display = "grid"
}

function onkeydown(e){

	let { key } = e;
	if(key == "Escape"){

		if(menu_toggled){
			map_data = get_chunks();
			open_menu();		
			
			menu_toggled = false;
		}else{	
			map_element.style.display = "none"
			menu_toggled = true
		}

	}

}

</script>

<style>
	
.map{
	position:absolute;
	top:0px;
	left:0px;
	display:none;

	grid-template-rows: repeat(100, 1fr);
	grid-template-columns: repeat(100, 1fr);


	width:100vw;
	height:100vh;
	grid-auto-flow:column;
}

</style>

<svelte:window {onkeydown}></svelte:window>



<div class="map" style="position:absolute;top:0px;left:0px;display:none;" bind:this={map_element}>
	
	{@html map_elements}

</div>
