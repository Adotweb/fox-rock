import { get } from "svelte/store";
import { global_state } from "../state/global.svelte";
import { mini_map_h, mini_map_w, screen_h, screen_w } from "../state/config.svelte";


const render_dist = 1;
let w = screen_w;
let h = screen_h;


//we try to minimze creation of new arrays so we pass in the buffers directly to the below functions so they can be altered in place

//we need to check if the chunk exists before we can access it
export function get_chunk(x, y){

	let world_map = get(global_state).world_map;

	if(x >= 0 && y >= 0){

	}else{
		return
	}
	try {
		return world_map[x][y]
	}catch{
		return
	}		
}


//every chunk that has a distance of at max render dist away from the chunk the player is in is loaded so we can display it (this way we can "see" further)
export function load_chunks(loaded_chunks) {
	loaded_chunks.length = 0;

	let chunk_pos = get(global_state).chunk_pos;
	let chunk_offset = get(global_state).chunk_offset;

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
                        loaded_chunks.push(chunk_info);
                }
        }
	//filter all the chunks that are not existant (theoretically we can overextend the map with the render distance)
	let filtered_chunks = loaded_chunks.filter(chunk => !!chunk.info)

	//since js doesnt allow in place modification of arrays via assignment we need to use this hack...
	loaded_chunks.length = 0
	loaded_chunks.push(...filtered_chunks)
}

//this actually creates all the edges to put into the edge buffer
export function load_edges(loaded_chunks, edges, mini_map_squares) {
	let chunk_w = get(global_state).chunk_w;
	let chunk_h = get(global_state).chunk_h;

	let chunk_pos = get(global_state).chunk_pos;
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
				//the "0, 0" block we start next to when the player is at "1, 1" is not objectively the 0, 0 block if our map is 100x100 for example
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
export function insert_into_sorted_array(sorted_array, value) {
        let left = 0;
        let right = sorted_array.length - 1;

        //perform binary search to find the insertion point
        while (left <= right) {
                const mid = Math.floor((left + right) / 2);
                if (sorted_array[mid].depth === value.depth) {
                        //if the value already exists, insert it at the same position
                        left = mid;
                        break;
                } else if (sorted_array[mid].depth <= value.depth) {
                        left = mid + 1;
                } else {
                        right = mid - 1;
                }
        }

        // Insert the value at the found position2
	// we do this inplace
        sorted_array.splice(left, 0, value);
}


//send the edges that need to be rendered to the render_order buffer, by effciently binary inserting into the buffer
export function prepare_edges(edges, render_order){
	let [px, py] = get(global_state).player_pos;
	let rot = get(global_state).player_rot;
	

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

		//the below is done to clip walls that have one edge behind the player, 
		//otherwise we have really weird renderedwalls with negative height...
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

		//this gives the two points for a single edge (l and r)
                let data = [x_l, x_r, z_l, z_r];


		//inserts the edge according to its midpoint depth (allows us to draw them in reverse order for an easy painters algorithm)
                insert_into_sorted_array(render_order, {
                        data,
			depth,
			color,
			type : "map"
                });
        }

}


//same for entities
export function prepare_entities(entities, render_order) {        	
	//we insert the entities into the render_order buffer so were able to draw them using the painters algorithm as well
	entities.forEach(render_entity => {	
		insert_into_sorted_array(render_order, {
			data : render_entity,
			...render_entity
		})
	})
}

export function render_buffer(ctx, mini_map_ctx, render_order) {
	
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
export function render_mini_map(mini_map_squares, mini_map_ctx){
	
	//we clear the mini map so we can draw to it
	mini_map_ctx.clearRect(0, 0, mini_map_w, mini_map_h)

	//we render every square (representing a wall block)
	mini_map_squares.forEach(square => mini_map_square(mini_map_ctx, square))	

	//this draw a green point in the middle of the screen (representing the player)
	mini_map_ctx.beginPath();
  	mini_map_ctx.arc(mini_map_w/2, mini_map_h/2, 5, 0, 2 * Math.PI, true);
  	mini_map_ctx.fillStyle = "green"
  	mini_map_ctx.fill();
}


//renders a single square to the mini-map
export function mini_map_square(mini_map_ctx, square){ 
	//precompute trig
	let rot = get(global_state).player_rot;
	let player_pos = get(global_state).player_pos;

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

		//these are the points on the mini map 
		//already accounted for clip space to screen space
		return [sz/10 * mini_map_w/2 + mini_map_w/2, -sx/10 * mini_map_w/2 + mini_map_w/2]	
	})

	//and then we use these points to draw a square to the minimap
	let [p1, p2, p3, p4] = square;


	//this just draws a square
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

