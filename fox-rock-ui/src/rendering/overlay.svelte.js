//here come the weapon animations (or rather THE animation...)

import { screen_h, screen_w } from "../state/config.svelte";


let pistol_animation_image = new Image()

pistol_animation_image.src = "./pistol_sheet.png";


pistol_animation_image.onload = () => {
	
}


export function render_pistol_idle(screen){
	//the height of the sprite on the screen
	let d_width = 500
	//make the sprite a square
	let d_height = d_width

	//return when the image is not laoded yet	
	if(!pistol_animation_image.complete){
		return
	}

	//we get these two because the pistol sprite has two states and like this we can just dviide by two
	let img_width = pistol_animation_image.width;
	let img_height = pistol_animation_image.height;

	//thsi draws the pistol in idle state
	screen.drawImage(pistol_animation_image, 0, 0, img_width/2, img_height,  screen_w/2 - d_width/4 - 20,  screen_h - d_height, d_width, d_height)		
}

//same as above but the active state is rendered
export function render_pistol_shooting(screen){
	let d_width = 500
	let d_height = d_width

	
	if(!pistol_animation_image.complete){
		return
	}

	let img_width = pistol_animation_image.width;
	let img_height = pistol_animation_image.height;

	//instead of starting to get the pixels of the image at 0, 0 we start at 50% 0 (halfway through)
	screen.drawImage(pistol_animation_image, img_width/2, 0, img_width/2, img_height,  screen_w/2 - d_width/4 - 20,  screen_h - d_height, d_width, d_height)		
}


let medkit_sheet = new Image()

medkit_sheet.src = "./medkit_sheet.png";


medkit_sheet.onload = () => {
	
}



export function render_medkit_unused(screen){
	//the height of the sprite on the screen
	let d_width = 500
	//make the sprite a square
	let d_height = d_width

	//return when the image is not laoded yet	
	if(!medkit_sheet.complete){
		return
	}

	//we get these two because the pistol sprite has two states and like this we can just dviide by two
	let img_width = medkit_sheet.width;
	let img_height = medkit_sheet.height;

	//thsi draws the pistol in idle state
	screen.drawImage(medkit_sheet, 0, 0, img_width/2, img_height,  screen_w/2 - d_width/4 - 100,  screen_h - d_height + 80, d_width, d_height)		
}

//same as above but the active state is rendered
export function render_medkit_used(screen){
	//the height of the sprite on the screen
	let d_width = 500
	//make the sprite a square
	let d_height = d_width

	//return when the image is not laoded yet	
	if(!medkit_sheet.complete){
		return
	}

	//we get these two because the pistol sprite has two states and like this we can just dviide by two
	let img_width = medkit_sheet.width;
	let img_height = medkit_sheet.height;

	//thsi draws the pistol in idle state
	screen.drawImage(medkit_sheet, img_width/2, 0, img_width/2, img_height,  screen_w/2 - d_width/4 - 100,  screen_h - d_height + 80, d_width, d_height)			
}


