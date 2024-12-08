
<script>

//provide the variables to later write the screen to
let screen;
let ctx;

let w = 800;
let h = 800;

let map_array = [
        0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
];


let s = [
	1, 1, 1, 0, 0, 1, 1, 1, 
	1, 0, 0, 0, 0, 0, 0, 1, 
	1, 0, 0, 0, 0, 0, 0, 1,
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0,
	1, 0, 0, 0, 0, 0, 0, 1,
	1, 0, 0, 0, 0, 0, 0, 1,
	1, 1, 1, 0, 0, 1, 1, 1
]

map_array = s;

let chunk_w = 8;
let chunk_h = 8;

//chunk position in the world (this is the xth chunk to the left etc.)
let chunk_pos = [0, 0];

//players position inside of a chunk
let chunk_coords = [0, 0];

//one cell in every direction making for 8 adjacent tiles
let render_dist = 1;

let map_size = 100

//all chunks
let chunks = Array.from({ length: map_size }, () => new Array(map_size).fill(false));

chunks[50][50] = map_array;

let world_dimensions = [map_size, map_size];

//this coordinate indicates where the 0, 0 chunk is stored in the chunks array
//and changes whenever the player adds new rows/columns to the chunks (only on the top and left...)
//so we can still say where the "original" 0, 0 chunk is
let chunk_offset = [Math.floor(map_size/2), Math.floor(map_size/2)];

//8 chunks surrounding the player + 1 chunks where the player stands in so we dont have to draw the whole chunks array
//can be adjusted depending on the render distance
let loaded_chunks = [];


function random_chunk(){
	return new Array(64).fill(0).map(s => Math.random() > .5 ? 0 : 1)
}
function generateWalkableChunk() {
    const SIZE = 8;

    // Helper to create a grid and populate it with random 0s (air) and 1s (walls)
    function generateGrid() {
        return Array.from({ length: SIZE }, () =>
            Array.from({ length: SIZE }, () => Math.random() > 0.3 ? 0 : 1)
        );
    }

    // Flood-fill to check if the grid is fully walkable
    function isWalkable(grid) {
        const visited = new Set();
        const directions = [
            [0, 1], [1, 0], [0, -1], [-1, 0] // Right, Down, Left, Up
        ];

        function inBounds(x, y) {
            return x >= 0 && x < SIZE && y >= 0 && y < SIZE;
        }

        // Start flood-fill from the top-left corner if it's air
        if (grid[0][0] === 1) return false;

        const stack = [[0, 0]];
        while (stack.length > 0) {
            const [x, y] = stack.pop();
            const key = `${x},${y}`;
            if (visited.has(key)) continue;
            visited.add(key);

            // Explore neighbors
            for (const [dx, dy] of directions) {
                const nx = x + dx;
                const ny = y + dy;
                if (inBounds(nx, ny) && grid[nx][ny] === 0 && !visited.has(`${nx},${ny}`)) {
                    stack.push([nx, ny]);
                }
            }
        }

        // Check if all air cells are visited
        return Array.from({ length: SIZE }, (_, x) =>
            Array.from({ length: SIZE }, (_, y) =>
                grid[x][y] === 0 ? visited.has(`${x},${y}`) : true
            )
        ).flat().every(v => v);
    }

    // Generate and validate the grid
    let grid;
    do {
        grid = generateGrid();
    } while (!isWalkable(grid));

    // Flatten the grid to a 1D array
    return grid.flat();
}


//is called when the chunks at x, y doesnt exist yet, we put it inside the chunks map when we created it
function generate_chunk(x, y){

	let generated_chunk = map_array//generateWalkableChunk();

	chunks[x][y] = generated_chunk;

	return generated_chunk

}

//we need to check if the chunk exists before we can access it
//if it doesnt we create it
function get_chunk(x, y){
	if(chunks[x][y]){
		return chunks[x][y]
	}else{
		return generate_chunk(x, y)
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
                if (sortedArray[mid].area === value.area) {
                        // If the value already exists, insert it at the same position
                        left = mid;
                        break;
                } else if (sortedArray[mid].area <= value.area) {
                        left = mid + 1;
                } else {
                        right = mid - 1;
                }
        }

        // Insert the value at the found position2
        sortedArray.splice(left, 0, value);
        return sortedArray;
}

let edges = [
        //[0, 0, 1, 1]
];
let render = [];

let player_pos = [2, 2];

let direction = [0, 0];
let speed = 0.05;
let rot = 0;
let rot_speed = 3;
let rot_dir = 0;
let view_cone_slope = 1;


let cos = (x) => Math.cos(x);
let sin = (x) => Math.sin(x);

function walk() {
        rot = rot - ((rot_dir * Math.PI) / 180) * rot_speed;

	//we store the players previous position so we can reset it if the player collides with a wall (so we dont move beyond a wall)
        let prev_pos = player_pos;

	//we need to rotate the velocity vector  to the view direction
        let walk_dir = [
                direction[0] * cos(rot) + direction[1] * -sin(rot),
                direction[0] * sin(rot) + direction[1] * cos(rot),
        ];

	//the players updated position after adding the velocity vector
        player_pos = [
                player_pos[0] + speed * walk_dir[0],
                player_pos[1] + speed * walk_dir[1],
        ];
        //to check for collision we first need to load in the data of the current chunk were in
        

	//these are the coordinates relative to the chunks 0, 0 (top left) cell
	//ccx = Chunk Coordinate X
        let ccx = player_pos[0] % chunk_w;
        let ccy = player_pos[1] % chunk_h;

        ccx = ccx < 0 ? chunk_w + ccx : ccx;
        ccy = ccy < 0 ? chunk_w + ccy : ccy;

        chunk_coords = [ccx, ccy];

	let prev_chunk_pos = chunk_pos;



	//the players current chunks position
	chunk_pos = [
		Math.floor(player_pos[0]/chunk_w),
		Math.floor(player_pos[1]/chunk_h),
	]


	//this is the array of the current chunk we are in, needs to be loaded in to check if we stand inside of a wall
	let map_array =
                chunks[chunk_pos[0] + chunk_offset[0]][
                        chunk_pos[1] + chunk_offset[1]
                ];

        //then we check if the player hits something inside the current chunk
        //(relative to it)
        let index = Math.floor(ccy) * chunk_w + Math.floor(ccx);

	//when the index of the players position returns a wall then we need to reset the players position
        if (map_array[index] == 1) {
                player_pos = prev_pos;
                return;
        }


        loaded_chunks = load_chunks();
        edges = [];
        create_map();
}


//sets the given directional input for movement
function onkeydown(e){
        let key = e.key;
        let keyCode = e.keyCode;

        if (key == 'ArrowLeft') {
                rot_dir = -1;
        }
        if (key == 'ArrowRight') {
                rot_dir = 1;
        }
        if (key == 'w') {
                direction[1] = 1;
        }
        if (key == 'a') {
                direction[0] = -1;
        }
        if (key == 's') {
                direction[1] = -1;
        }
        if (key == 'd') {
	console.log("hello")
                direction[0] = 1;
        }
}

//reacts to keyup events to reset the given directional input
function onkeyup(e){
        let key = e.key;
        let keyCode = e.keyCode;
        if (key == 'ArrowLeft') {
                rot_dir = 0;
        }
        if (key == 'ArrowRight') {
                rot_dir = 0;
        }
        if (key == 'w') {
                direction[1] = 0;
        }
        if (key == 'a') {
                direction[0] = 0;
        }
        if (key == 's') {
                direction[1] = 0;
        }
        if (key == 'd') {
                direction[0] = 0;
        }
}

function render_edges(edges) {
        let [px, py] = player_pos;
	//precompute cos and sin to save computing power
        let csx = cos(rot);
        let snx = sin(rot);
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

                let area = (z_l + z_r) / 2;

                let data = [x_l, x_r, z_l, z_r];


		//inserts the edge according to its midpoint depth (allows us to draw them in reverse order for an easy painters algorithm)
                render = insertIntoSortedArray(render, {
                        data,
                        area,
                        face: edge,
			color
                });
        }
        render.reverse().forEach(({ data, color }) => {
                let [x_l, x_r, z_l, z_r] = data;

                //fix this so all faces are rendered....

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

import {onMount} from "svelte";

let fps = 60;

//initialize the chunks and map
onMount(() => {
	ctx = screen.getContext('2d');
	

	loaded_chunks = load_chunks();
	create_map();


	//main game loop
	//1. create empty buffer to write screen data to 
	//2. clear the screen 
	//3. update positions and get the edges relative to the player
	//4. render the edges

	setInterval(() => {
        	render = [];
        	ctx.clearRect(0, 0, w, h);
        	walk();
        	render_edges(edges);
		//console.log(player_pos)
	}, 1000 / fps);

})
//console.log(blue_counter)
</script>


//the events need to be registered on the very top in the DOM
<svelte:window {onkeydown} {onkeyup}>
<canvas  bind:this={screen} style="border:1px solid black;" width={w} height={h}></canvas>
