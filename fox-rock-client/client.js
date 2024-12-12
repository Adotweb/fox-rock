let ws_connection = new WebSocket("ws://localhost:3000");

let send_update;


ws_connection.onopen = () => {
	send_update = update => ws_connection.send(JSON.stringify({...update, type:"update"}))
}

let direction = [0, 0];

let rot_dir = 0

document.addEventListener("keydown", (e) => {
	console.log(e.key)
	if(e.key == "w"){
		direction[1] = -1;
	}
	if(e.key == "a"){
		direction[0] = -1;
	}
	if(e.key == "s"){
		direction[1] = 1;
	}
	if(e.key == "d"){
		direction[0] = 1;
	}


	if(e.key == "ArrowLeft"){
		rot_dir = -1
	}
	if(e.key == "ArrowRight"){
		rot_dir = 1
	}

	let input = ({direction, rotation: rot_dir})
	send_update({input})
})

document.addEventListener("keyup", (e) => {

	if(e.key == "w"){
		direction[1] = 0;
	}
	if(e.key == "a"){
		direction[0] = 0;
	}
	if(e.key == "s"){
		direction[1] = 0;
	}
	if(e.key == "d"){
		direction[0] = 0;
	}


	if(e.key == "ArrowLeft"){
		rot_dir = 0
	}
	if(e.key == "ArrowRight"){
		rot_dir = 0
	}
	let input = ({direction, rotation: rot_dir})
	send_update({input})
})

