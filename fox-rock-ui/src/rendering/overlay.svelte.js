//here come the weapon animations (or rather THE animation...)

import { screen_h, screen_w } from "../state/config.svelte";


let pistol_animation_image = new Image()

pistol_animation_image.src = "./public/pistol_sheet.png";


pistol_animation_image.onload = () => {
	
}



export function render_pistol_idle(screen){
	let d_width = 500
	let d_height = d_width

	
	if(!pistol_animation_image.complete){
		return
	}

	let img_width = pistol_animation_image.width;
	let img_height = pistol_animation_image.height;


	screen.drawImage(pistol_animation_image, 0, 0, img_width/2, img_height,  screen_w/2 - d_width/4 - 20,  screen_h - d_height, d_width, d_height)		
}


export function render_pistol_shooting(screen){
	let d_width = 500
	let d_height = d_width

	
	if(!pistol_animation_image.complete){
		return
	}

	let img_width = pistol_animation_image.width;
	let img_height = pistol_animation_image.height;


	screen.drawImage(pistol_animation_image, img_width/2, 0, img_width/2, img_height,  screen_w/2 - d_width/4 - 20,  screen_h - d_height, d_width, d_height)		
}
