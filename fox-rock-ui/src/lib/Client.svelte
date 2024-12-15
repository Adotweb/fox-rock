<script>
import { onMount } from "svelte"
import { entity_rendering_map } from "../render-entites/entities";

//game connection things
let ws_connection = new WebSocket("ws://localhost:3000");

//give a handle to the send input function 
let send_input;

//storage variable for the id later
let player_id;

ws_connection.onopen = () => {

	//when the websocket connection or p2p connection is established we set the sendinput function
	send_input = (update) => ws_connection.send(JSON.stringify({
		input : update,	
		type : "update"
	}))

}

ws_connection.onmessage = (proto) => {

	
	let data = JSON.parse(proto.data);

	//the first message well receive from the server is the initial message that contains:
	//- our player id 
	//- our position and roation
	//- the map and its offset 
	//- and the chunk width and height
	if(data.type == "initialize"){


		world_map = data.world_map

		player_id = data.player_id
		
		chunk_offset = data.chunk_offset;
		player_pos = data.position;
		chunk_coords = data.chunk_coords;
		chunk_pos = data.chunk_pos;
		rot = data.player_rot;

		//chunk_w = data.chunk_width;
		//chunk_h = data.chunk_height;

		return
	}

	//an update is sent every couple of milliseconds to keep the state of the server and client synced	
	if(data.type == "update"){
		

		//first we update every entities state and rendering that is not the player
		entities = data.entities
		.filter(entity => entity.id !== player_id)
		.map(entity => new entity_rendering_map[entity.name](entity.position, player_pos, rot))




		//we need to isolate the player from the entitites in the servers state	
		let player = data.entities.filter(entity => entity.id == player_id)[0];

		//now we get the new positions to later check if we have changed (to save time in rendering)
		let new_chunk_coords = player.chunk_coords;
		let new_player_pos = player.position;
		let new_rot = player.rotation;
		let new_chunk_pos = player.chunk_pos;


		//we check if the players position has somehow changed, if it has we update the rendering of walls etc, else we skip this step
		if(
			new_chunk_pos[0] == chunk_pos[0] && new_chunk_pos[1] == chunk_pos[1] && 
			new_player_pos[0] == player_pos[0] && new_player_pos[1] == player_pos[1] &&
			new_chunk_coords[0] == chunk_coords[0] && new_chunk_coords[1] == chunk_coords[1] &&
			new_rot == rot
		)			{
			return
		}else{
			

			//overwrite the old values
			chunk_coords = new_chunk_coords;
			player_pos = new_player_pos;
			chunk_pos = new_chunk_pos;
			rot = new_rot

			//empty the edge and mini_map render buffers
			edges = [];
			mini_map_squares = [];

			//load the new chunks 
			loaded_chunks = load_chunks();
			create_map();
			
		}
	}
	
}

//input direction
let direction = [0, 0];
//the direction in which we are rotating
let rot_dir = 0;
//the above two will only ever be sent to the server and have no use for the clients code


//input map to overwrite the direction and rot_dir
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

//same here
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
//the current rotation of the player
let rot = 0;
//position of the chunk the players in 
let chunk_pos = [0, 0];
//position of the player relative to the chunks [0, 0] coordinate
let chunk_coords = [0, 0];
//this is the center chunk (if the array is 100x100 chunks big then the offset will be [50, 50])
let chunk_offset = [0, 0];

//the width and height of a single chunk
let chunk_w = 8;
let chunk_h = 8;

//we start by filling some randomg array 
//this will be overwritten with the data that is sent by the server
let world_map = Array.from({length : 100}, () => new Array(100).fill(false));


//we write some random array into the first chunk /doesnt really matter, this array will be overwritten anyway
world_map[chunk_offset[0]][chunk_offset[1]] = [
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

//store handles to the screen and its context (for drawing later)
let screen;
let ctx;


//same here for the mini-map screen
let mini_map_w = 300;
let mini_map_h = 300;
let mini_map;
let mini_map_ctx;

//rendering
let render_dist = 1;
//the buffer with the loaded chunks in it
let loaded_chunks = [];
//the buffer of all edges  in the current loaded chunks
//i should really be talking about faces, but since the game could very well be played just top down ill stick to edges
let edges = [];
//the buffer of all points to draw them on the mini-map
let mini_map_squares = [];

//entity buffer
let entities = [];


//the buffer of all faces, entities and so on from back to front, so we can do a painters algorithm
let render_order = [];



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

	//we load a square of 2 * render_dist + 1 around the player into memory
	//so we dont have to load the entire map into the edge buffer for rendering
        for (let y = -render_dist; y <= render_dist; y++) {
                for (let x = -render_dist; x <= render_dist; x++) {
		
			//we get the current chunk_position by getting our 
			//player.chunk_pos + chunk_offset + the index of the current chunk in the chunks around the player
			let chunk_pos_in_world = [
				x + chunk_offset[0] + chunk_pos[0],
				y + chunk_offset[1] + chunk_pos[1]
			]
			

			//the map map_information is the actual chunk data (where there are walls and where not)
			let map_information = get_chunk(...chunk_pos_in_world);


			//we load the wall data and position into the loaded_chunks
                       	let chunk_info = {
                                info: map_information,
                                position: [x + chunk_pos[0], y + chunk_pos[1]],
                        };
                        loadable_chunks.push(chunk_info);
                }
        }


        return loadable_chunks;
}

//this actually creates all the edges to put into the edge buffer
function create_map() {

	//we need to move through every chunk in the loaded_chunks
        for (let i = 0; i < loaded_chunks.length; i++) {
		//since laoded_chunks is a 1d array we have to retrieve the x and y coordiantes of the current chunk declaratively	
		let render_side = (2 * render_dist + 1);
		let load_x = i % render_side;
		let load_y = Math.floor(i / render_side);
	
		
		



		//we need to get the loaded chunks data to parse it into the edge buffer
                let map_array = loaded_chunks[i].info;

		//the offset of the chunk is the position of the chunk in the overall array
                let offset = loaded_chunks[i].position;
		//we move through all the cells in the chunk and insert the edges of the wall cubes (if they are walls)
                for (let x = 0; x < chunk_w; x++) {
                        for (let y = 0; y < chunk_h; y++) {
				let color = "red"	
				
				//here we need the offset to get the "objective positions of the blocks"
				//we do this to accurately map them to relative positions to the player
				//the "0, 0" block we start next to when the player is at "1, 1" is not objectively the 0, 0 block if our map is 100x100
                                let x_u = offset[0] * chunk_w + x;
                                let y_u = offset[1] * chunk_h + y;

				//to get the chunk_index we use the chunk relative coordinates however
                                let chunk_index = y * chunk_w + x;
                                let chunk_block = map_array[chunk_index];

				//id 1 means normal red wall so we set the color = red
				if(chunk_block == 1){	
					color = "red"
				}

				//checking if were at the border is pretty easy, we just check if we are at the very 0 column/row or the very last column/row	
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
					//top-left -> top-right					
                                        let edge1 = [x_u, y_u, x_u + 1, y_u];
					//top-right -> bottom-right
                                        let edge2 = [
                                                x_u + 1,
                                                y_u,
                                                x_u + 1,
                                                y_u + 1,
                                        ];

					//bottom-right to bottom-left
                                        let edge3 = [
                                                x_u + 1,
                                                y_u + 1,
                                                x_u,
                                                y_u + 1,
                                        ];

					//bottom-left to top-left
                                        let edge4 = [x_u, y_u + 1, x_u, y_u];

					//add the whole square to the mini_map render buffer
					mini_map_squares.push([
						[x_u, y_u],
						[x_u + 1, y_u],
						[x_u + 1, y_u + 1],
						[x_u, y_u + 1]	
					])

					//push all the edges to the buffer
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

//we do this because even though array.sort would work perfectly fine 
//im already pretty inefficent and nlogn is still a bit better than n + nlogn...
//
//also we sort by depth of whatever object were passing in
function insert_into_sorted_array(sortedArray, value) {
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
	// we do this inplace
        sortedArray.splice(left, 0, value);
}

function render_edges(edges) {
        let [px, py] = player_pos;
	//precompute cos and sin to save computing power
        let csx = Math.cos(rot);
        let snx = Math.sin(rot);
        for (let i = 0; i < edges.length; i++) {
                let {edge, color} = edges[i];


		//lx, ly, rx and ry are the first and second points of any given edge
		//i have called them that because i like to use letters instead of numbers x1 x2 y1 y2...
                let [lx, ly, rx, ry] = edge;
		
		//get the points relative to the player along the map axis
                [lx, ly, rx, ry] = [lx - px, ly - py, rx - px, ry - py];


		//convert map-axis relative points to player z and x axis relative points
		//(to know how/where we look)
                let [x_l, z_l] = [lx * csx + ly * snx, lx * -snx + csx * ly];
                let [x_r, z_r] = [rx * csx + ry * snx, rx * -snx + csx * ry];

                const near = 0.1; //small positive value to avoid clipping at z = 0
                if (z_l < near && z_r < near) {
                        //both points are behind the near plane, discard edge
                        continue;
                }

                if (z_l < near || z_r < near) {
                        //clip the edge to the near plane
                        const t =
                                z_l < near
                                        ? (near - z_l) / (z_r - z_l)
                                        : (near - z_r) / (z_l - z_r);

                        if (z_l < near) {
                                //clip the left endpoint
                                x_l = x_l + t * (x_r - x_l);
                                z_l = near; //set z to the near plane
                        } else {
                                //clip the right endpoint
                                x_r = x_r + t * (x_l - x_r);
                                z_r = near; //set z to the near plane
                        }
                }

                //skip edges with invalid coordinates
                if (z_l <= 0 || z_r <= 0) {
                        continue;
                }
		//since we dont have intersecting faces (for now) we can sort the faces by using the average distance along the z axis
		//between the player and the two points that make up an edge
                let depth = (z_l + z_r) / 2;

                let data = [x_l, x_r, z_l, z_r];


		//inserts the edge according to its midpoint depth (allows us to draw them in reverse order for an easy painters algorithm)
                insert_into_sorted_array(render_order, {
                        data,
			depth,
			color,
			type : "map"
                });
        }
	
	//we insert the entities into the render_order buffer so were able to draw them using the painters algorithm as well
	entities.forEach(render_entity => {	
		insert_into_sorted_array(render_order, {
			data : render_entity,
			...render_entity
		})
	})

        render_order.reverse().forEach(({ data, color, type, depth}) => {

		if(type == "entity")	{
			//in the case the object is an entity we use the entities render logic
			//this allows us to make the render logic whatever we want for different entities
			data.render(ctx, mini_map_ctx)
			return
		}

                let [x_l, x_r, z_l, z_r] = data;
		//rendering walls or blocks	
		//we use the canvas drawing
                ctx.beginPath();

		//by perspective geometry math we have the x position on the screen to be x/z and the wall_height 1/z 
		//this means 1/(2 *z) above and below the middle axis so we need to offset the middle point by w/2 and h/2 and add these four numbers
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

		//filling commands
                ctx.fillStyle = color;
                ctx.fill();
                ctx.stroke();
        });
}

//mini map rendering 
//this renders every mini-map sqaure in the mini_map render_buffer
function render_mini_map(){

	mini_map_ctx.clearRect(0, 0, mini_map_w, mini_map_h)

	mini_map_squares.forEach(mini_map_square)	


	mini_map_ctx.beginPath();
  	mini_map_ctx.arc(mini_map_w/2, mini_map_h/2, 5, 0, 2 * Math.PI, true);
  	mini_map_ctx.fillStyle = "green"
  	mini_map_ctx.fill();
}


//renders a single square to the mini-map
function mini_map_square(square){ 
	//precompute trig
	let csx = Math.cos(rot);
	let snx = Math.sin(rot)

	//for every point of the square we do the relative positioning math	
	square = square.map(([x, y]) => {
		//relative coordinates along world axis
		let [rel_x, rel_y] = [x - player_pos[0], y - player_pos[1]];

		//relative coordinates along the cameras x and z axis
		let [sz, sx] = [
			rel_x * csx + rel_y * snx,
			rel_x * -snx + rel_y * csx
		]


		return [sz/10 * mini_map_w/2 + mini_map_w/2, -sx/10 * mini_map_w/2 + mini_map_w/2]	
	})

	//and then we use these points to draw a square to the minimap
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
	//set the contexts as soon as they are ready
	ctx = screen.getContext("2d");
	mini_map_ctx = mini_map.getContext("2d")
})


//main game loop
//repeat the below loop 60 times each second
let fps = 60
setInterval(() => {
	//clear the render_order buffer
	render_order = [];

	//if either context is undefined we skip the rendering
	if(!ctx || !mini_map_ctx){
		return
	}

	//clear the canvases to redraw
	ctx.clearRect(0, 0, w, h);
	mini_map_ctx.clearRect(0, 0, mini_map_w, mini_map_h)
	
	//render the squares to the mini-map
	render_mini_map();

	//send the player input to the server/p2p-host
	send_input({
		direction,
		rotation : rot_dir
	});

	//render the 3d edges, entities and entity points to the mini-map
	render_edges(edges)

}, 1000/fps)

</script>

<style>
/* this makes the mini-map a circle at the top right */
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
