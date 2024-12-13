<script>
import { onMount } from "svelte"

//game connection things
let ws_connection = new WebSocket("ws://localhost:3000");

let send_input;

let player_id;

ws_connection.onopen = () => {

	send_input = (update) => ws_connection.send(JSON.stringify({
		input : update,	
		type : "update"
	}))

}

ws_connection.onmessage = (proto) => {


	let data = JSON.parse(proto.data);


	if(data.type == "initialize"){


		world_map = data.world_map

		player_id = data.player_id
		
		chunk_offset = data.chunk_offset;
		player_pos = data.position;
		chunk_coords = data.chunk_coords;
		chunk_pos = data.chunk_pos;
		rot = data.player_rot;


		return
	}

	
	if(data.type == "update"){
		
		let player = data.entities.filter(entity => entity.id == player_id)[0];
		
		let new_chunk_coords = player.chunk_coords;
		let new_player_pos = player.position;
		let new_rot = player.rotation;
		let new_chunk_pos = player.chunk_pos;
		
		entities = data.entities

		if(
			new_chunk_pos[0] == chunk_pos[0] && new_chunk_pos[1] == chunk_pos[1] && 
			new_player_pos[0] == player_pos[0] && new_player_pos[1] == player_pos[1] &&
			new_chunk_coords[0] == chunk_coords[0] && new_chunk_coords[1] == chunk_coords[1] &&
			new_rot == rot
		)			{
			return
		}else{
	
			chunk_coords = new_chunk_coords;
			player_pos = new_player_pos;
			chunk_pos = new_chunk_pos;
			rot = new_rot

			edges = [];
			mini_map_squares = [];


			loaded_chunks = load_chunks();

			create_map();
			
		}
	}
	
}

//input
let direction = [0, 0];
let rot = 0;
let rot_dir = 0;

function onkeydown(e){
	if(e.key == "w"){
		direction[1] = -1;
	}if(e.key == "a"){
		direction[0] = -1;
	}if(e.key == "s"){
		direction[1] = 1;
	}if(e.key == "d"){
		direction[0] = 1;
	}if(e.key == "ArrowLeft"){
		rot_dir = -1
	}if(e.key == "ArrowRight"){
		rot_dir = 1
	}


}

function onkeyup(e){
	if(e.key == "w"){
		direction[1] = 0;
	}if(e.key == "a"){
		direction[0] = 0;
	}if(e.key == "s"){
		direction[1] = 0;
	}if(e.key == "d"){
		direction[0] = 0;
	}if(e.key == "ArrowLeft"){
		rot_dir = 0
	}if(e.key == "ArrowRight"){
		rot_dir = 0
	}
}
//game state things

//player_position 

let player_pos = [0, 0];
let chunk_pos = [0, 0];
let chunk_coords = [0, 0];
let chunk_offset = [0, 0];

let chunk_w = 8;
let chunk_h = 8;

let world_map = Array.from({length : 100}, () => new Array(100).fill(false));

world_map[50][50] = [
	1, 1, 1, 0, 0, 1, 1, 1, 
	1, 0, 0, 0, 0, 0, 0, 1, 
	1, 0, 0, 0, 0, 0, 0, 1,
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0,
	1, 0, 0, 0, 0, 0, 0, 1,
	1, 0, 0, 0, 0, 0, 0, 1,
	1, 1, 1, 0, 0, 1, 1, 1
]



//screen stuff
let w = 800;
let h = 800;

let screen;
let ctx;


let mini_map_w = 300;
let mini_map_h = 300;
let mini_map;
let mini_map_ctx;

//rendering
let edges = [];
let mini_map_squares = [];

let entities = [];

let render_order = [];

let loaded_chunks = [];


let render_dist = 1;

//we need to check if the chunk exists before we can access it
//if it doesnt we create it
function get_chunk(x, y){

	if(x >= 0 && y >= 0){

	}else{
		return
	}
	if(world_map[x][y]){
		
		return world_map[x][y]
	}else{

	}
}


//every chunk that has a distance of at max render dist away from the chunk the player is in is loaded so we can display it (this way we can "see" further)
function load_chunks() {
        let loadable_chunks = [];


        for (let y = -render_dist; y <= render_dist; y++) {
                for (let x = -render_dist; x <= render_dist; x++) {
			
			let chunk_pos_in_world = [
				x + chunk_offset[0] + chunk_pos[0],
				y + chunk_pos[1] +  chunk_offset[1]
			]

			let map_information = get_chunk(...chunk_pos_in_world);

                       let chunk_info = {
                                info: map_information,
                                position: [x + chunk_pos[0], y + chunk_pos[1]],
                        };
                        loadable_chunks.push(chunk_info);
                }
        }


        return loadable_chunks;
}

let blue_counter = 0;

function create_map() {

        for (let i = 0; i < loaded_chunks.length; i++) {

		let render_side = (2 * render_dist + 1);
		let load_x = i % render_side;
		let load_y = Math.floor(i / render_side);
	
		
		
		//border chunk filter
		let is_border_chunk = (load_x == 0 || load_y == 0 || load_x == render_side - 1 || load_y == render_side - 1);

		let direction = null;


		//we need to check the direction of the chunk to get the border walls of the chunk
		//luckily the first render_side chunks are top chunks (with the first and last of the row being corner chunks)
		//the last render side are the bottom chunks (again the first and last are corner chunks)
		//and anything in between is a left and right chunk alternating
		if(is_border_chunk){
	
			if(load_x == 0){
				direction = "left"
			}
			if(load_x == render_side - 1){
				direction = "right"
			}
			if(load_y == 0){
				direction = "up"
				if(load_x == 0){
					direction = "up-left"
				}
				if(load_x == render_side - 1){
					direction = "up-right"
				}
			}
			if(load_y == render_side - 1){
				direction = "down"
				if(load_x == 0){
					direction = "down-left"
				}
				if(load_x == render_side - 1){
					direction = "down-right"
				}
			}

			//in the case that the render distance is 0 all the borders of the chunk are borders
			if(0 == render_side - 1){
				direction = "1dist"
			}

		}

                let map_array = loaded_chunks[i].info;

                let offset = loaded_chunks[i].position;
		//we move through all the cells in the chunk and insert the edges of the wall cubes (if they are walls)
                for (let x = 0; x < chunk_w; x++) {
                        for (let y = 0; y < chunk_h; y++) {
				let color = "red"	

                                let x_u = offset[0] * chunk_w + x;
                                let y_u = offset[1] * chunk_h + y;

                                let chunk_index = y * chunk_w + x;
                                let chunk_block = map_array[chunk_index];

				//id 1 means normal red wall so we set the color = red
				if(chunk_block == 1){	
					color = "red"
				}

				let checks = {
					"left" : x == 0,
					"right" : x == chunk_w - 1,
					"up" : y == 0,
					"down" : y == chunk_h - 1,

					"up-left" : x == 0 || y == 0,
					"up-right" : x == chunk_w - 1 || y == 0,
					"down-left" : x == 0 || y == chunk_h - 1,
					"down-right" : x == chunk_w - 1 || y == chunk_h - 1,
					"1dist" : x == chunk_w - 1 || y == chunk_h - 1 || x == 0 || y == 0
				}
				
				let left_border = x_u == -render_dist * chunk_w + chunk_w * chunk_pos[0]
				let right_border = x_u == 2 * render_dist * chunk_w - 1 + chunk_w * chunk_pos[0]
				let top_border = y_u == -render_dist * chunk_h + chunk_h * chunk_pos[1]
				let bottom_border = y_u == 2 * render_dist * chunk_h - 1 + chunk_h * chunk_pos[1]
		
				//also if the block is a render border (the furthest we can see)
				//we make a single face of a different color to indicate we cant see further
				//depending on the orientation of the wall
				if(left_border){
					edges.push({
						color : "blue",
						edge : [x_u, y_u, x_u, y_u + 1]
					})
				}
				if(right_border){
					edges.push({
						color : "blue",
						edge : [x_u + 1, y_u, x_u + 1, y_u + 1]
					})
				}
				if(top_border){
					edges.push({
						color : "blue",
						edge : [x_u, y_u, x_u + 1, y_u]
					})
				}
				if(bottom_border){
					edges.push({
						color : "blue",
						edge : [x_u, y_u + 1, x_u + 1, y_u + 1]
					})
				}

			
				//this means that the block is not "air" and we have to place some block
				if(chunk_block != 0){

                                        let edge1 = [x_u, y_u, x_u + 1, y_u];
                                        let edge2 = [
                                                x_u + 1,
                                                y_u,
                                                x_u + 1,
                                                y_u + 1,
                                        ];
                                        let edge3 = [
                                                x_u + 1,
                                                y_u + 1,
                                                x_u,
                                                y_u + 1,
                                        ];
                                        let edge4 = [x_u, y_u + 1, x_u, y_u];




					mini_map_squares.push([
						[x_u, y_u],
						[x_u + 1, y_u],
						[x_u + 1, y_u + 1],
						[x_u, y_u + 1]	
					])


                                        edges.push({
						color,
						edge : edge1
					});
                                        edges.push({
						color, 
						edge : edge2
					});
                                        edges.push({
						color, 
						edge : edge3}
					);
                                        edges.push({
						color, 
						edge : edge4
					});
				}	

                        }
                }
        }

}


function insertIntoSortedArray(sortedArray, value) {
        let left = 0;
        let right = sortedArray.length - 1;

        // Perform binary search to find the insertion point
        while (left <= right) {
                const mid = Math.floor((left + right) / 2);
                if (sortedArray[mid].depth === value.depth) {
                        // If the value already exists, insert it at the same position
                        left = mid;
                        break;
                } else if (sortedArray[mid].depth <= value.depth) {
                        left = mid + 1;
                } else {
                        right = mid - 1;
                }
        }

        // Insert the value at the found position2
        sortedArray.splice(left, 0, value);
        return sortedArray;
}

function render_edges(edges) {
        let [px, py] = player_pos;
	//precompute cos and sin to save computing power
        let csx = Math.cos(rot);
        let snx = Math.sin(rot);
        for (let i = 0; i < edges.length; i++) {
                let {edge, color} = edges[i];

                let [lx, ly, rx, ry] = edge;
		
		//get the points relative to the player along the map axis
                [lx, ly, rx, ry] = [lx - px, ly - py, rx - px, ry - py];

                let rel = [
                        [lx, ly],
                        [rx, ry],
                ];

		//convert map-axis relative points to player z and x axis relative points
		//(to know how/where we look)
                let [x_l, z_l] = [lx * csx + ly * snx, lx * -snx + csx * ly];
                let [x_r, z_r] = [rx * csx + ry * snx, rx * -snx + csx * ry];

                const near = 0.1; // Small positive value to avoid clipping at z = 0
                if (z_l < near && z_r < near) {
                        // Both points are behind the near plane, discard edge
                        continue;
                }

                if (z_l < near || z_r < near) {
                        // Clip the edge to the near plane
                        const t =
                                z_l < near
                                        ? (near - z_l) / (z_r - z_l)
                                        : (near - z_r) / (z_l - z_r);

                        if (z_l < near) {
                                // Clip the left endpoint
                                x_l = x_l + t * (x_r - x_l);
                                z_l = near; // Set z to the near plane
                        } else {
                                // Clip the right endpoint
                                x_r = x_r + t * (x_l - x_r);
                                z_r = near; // Set z to the near plane
                        }
                }

                // Skip edges with invalid coordinates
                if (z_l <= 0 || z_r <= 0) {
                        continue;
                }

                let depth = (z_l + z_r) / 2;

                let data = [x_l, x_r, z_l, z_r];


		//inserts the edge according to its midpoint depth (allows us to draw them in reverse order for an easy painters algorithm)
                render_order = insertIntoSortedArray(render_order, {
                        data,
			depth,
			color,
			type : "map"
                });
        }
        render_order.reverse().forEach(({ data, color, type, depth}) => {

		if(type == "entity")	{
			//in the case the object is an entity we use the entities render logic
			data.render(ctx, mini_map_ctx)
			return
		}

                let [x_l, x_r, z_l, z_r] = data;
		//rendering walls or blocks	
                ctx.beginPath();
                ctx.moveTo(
                        ((x_l / z_l) * w) / 2 + w / 2,
                        h / 2 + ((1 / z_l / 2) * h) / 2
                );
                ctx.lineTo(
                        ((x_l / z_l) * w) / 2 + w / 2,
                        h / 2 - ((1 / z_l / 2) * h) / 2
                );
                ctx.lineTo(
                        ((x_r / z_r) * w) / 2 + w / 2,
                        h / 2 - ((1 / z_r / 2) * h) / 2
                );
                ctx.lineTo(
                        ((x_r / z_r) * w) / 2 + w / 2,
                        h / 2 + ((1 / z_r / 2) * h) / 2
                );

                ctx.lineTo(
                        ((x_l / z_l) * w) / 2 + w / 2,
                        h / 2 + ((1 / z_l / 2) * h) / 2
                );
                ctx.fillStyle = color;
                ctx.fill();
                ctx.stroke();
        });
}

//mini map rendering 


function render_mini_map(){

	mini_map_ctx.clearRect(0, 0, mini_map_w, mini_map_h)

	mini_map_squares.forEach(mini_map_square)	


	mini_map_ctx.beginPath();
  	mini_map_ctx.arc(mini_map_w/2, mini_map_h/2, 5, 0, 2 * Math.PI, true);
  	mini_map_ctx.fillStyle = "green"
  	mini_map_ctx.fill();
}

function mini_map_square(square){ 


	let csx = Math.cos(rot);
	let snx = Math.sin(rot)

	square = square.map(([x, y]) => {

		let [rel_x, rel_y] = [x - player_pos[0], y - player_pos[1]];

		let [sz, sx] = [
			rel_x * csx + rel_y * snx,
			rel_x * -snx + rel_y * csx
		]


		return [sz/10 * mini_map_w/2 + mini_map_w/2, -sx/10 * mini_map_w/2 + mini_map_w/2]	
	})

	let [p1, p2, p3, p4] = square;

	mini_map_ctx.beginPath();

	mini_map_ctx.moveTo(...p1)
	mini_map_ctx.lineTo(...p2)
	mini_map_ctx.lineTo(...p3)
	mini_map_ctx.lineTo(...p4)
	mini_map_ctx.lineTo(...p1)

	mini_map_ctx.fillStyle = "red"
	mini_map_ctx.fill()
	mini_map_ctx.stroke()
	
}




onMount(() => {
	ctx = screen.getContext("2d");
	mini_map_ctx = mini_map.getContext("2d")
})


//main game loop
let fps = 60
setInterval(() => {

	render_order = [];
	if(!ctx || !mini_map_ctx){
		return
	}

	ctx.clearRect(0, 0, w, h);

	mini_map_ctx.clearRect(0, 0, mini_map_w, mini_map_h)

	send_input({
		direction,
		rotation : rot_dir
	});
	
	render_edges(edges)
	render_mini_map();

}, 1000/fps)

</script>

<style>

.mini-map{
	position:absolute;
	top:10px;
	right:10px;
	background-color: white;
	height: 300px;
	width:300px;
	border-radius: 50%;
	border : 1px solid black;
}

.screen{
	border : 1px solid black;
}

</style>

<svelte:window {onkeyup} {onkeydown}></svelte:window>

<canvas class="mini-map" bind:this={mini_map} width={mini_map_w} height={mini_map_h}></canvas>

<canvas class="screen" bind:this={screen} width={w} height={h}></canvas>
