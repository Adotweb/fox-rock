let screen = document.getElementById("screen")

let ctx = screen.getContext("2d");

let w = 800;
let h = 800;

screen.width = w;
screen.height = h;
let map_array = 
[1, 1, 1, 0, 0, 1, 1, 1,
 1, 0, 0, 0, 0, 0, 0, 1,
 1, 0, 0, 0, 0, 0, 0, 1,
 0, 0, 0, 1, 1, 0, 0, 0,
 0, 0, 0, 1, 1, 0, 0, 0,
 1, 0, 0, 0, 0, 0, 0, 1,
 1, 0, 0, 0, 0, 0, 0, 1,
 1, 1, 1, 0, 0, 1, 1, 1]

let chunk_w = 8;
let chunk_h = 8;

//chunk position in the world (this is the xth chunk to the left etc.)
let chunk_pos = [0, 0]

//players position inside of a chunk
let chunk_coords = [0, 0]

//one cell in every direction making for 8 adjacent tiles
let render_dist = 1;

//all chunks
let chunks = new Array(3).fill(new Array(3).fill(map_array))


let world_dimensions = [3, 3]
//this coordinate indicates where the 0, 0 chunk is stored in the chunks array
//and changes whenever the player adds new rows/columns to the chunks (only on the top and left...)
let chunk_offset = [1, 1];

//8 chunks surrounding the player + 1 chunks where the player stands in so we dont have to draw the whole chunks array
let loaded_chunks = []

//takes (and "generates") the chunks adjacent to the player
//if no such chunks exist (i.e. at the border we generate the chunks)
function load_chunks(){
	let loadable_chunks = [];


	for(let y = -render_dist; y <= render_dist; y++){

		let chunk_row_index = chunk_pos[1] + y + chunk_offset[1];

		if(chunk_row_index <= 0){
			let new_row = new Array(world_dimensions[0]).fill(map_array);

			chunks.unshift(new_row)
			chunk_offset[1] += 1;
			world_dimensions[1] += 1;

		}if(chunk_row_index >= world_dimensions[1]){
			let new_row = new Array(world_dimensions[0]).fill(map_array);

			chunks.push(new_row)
			world_dimensions[1] += 1;
		}

		let row = chunks[chunk_row_index];


		for(let x = -render_dist; x <= render_dist; x++){

			let chunk_column_index = chunk_pos[0] + x + chunk_offset[0];

			if(chunk_column_index <= 0){
				

				chunks.forEach((chunk, index) => {
					chunks[index].unshift(map_array)
				})

				chunk_offset[0] += 1;
				world_dimensions[0] += 1;

			}
			if(chunk_column_index >= world_dimensions[0]){

				chunks.forEach((chunk, index) => {
					chunks[index].push(map_array)
				})

				world_dimensions[0] += 1;
			}
			let map_information = row[chunk_column_index];
				

			let chunk_info = {
				info : map_information,
				position : [x + chunk_pos[0], y + chunk_pos[1]]
			}
			loadable_chunks.push(chunk_info)
		}
	}

	return loadable_chunks;
}

function create_map(){
	for(let i = 0; i < loaded_chunks.length; i++){
		let map_array = loaded_chunks[i].info;

		let offset = loaded_chunks[i].position;
  		for(let x = 0; x < chunk_w; x++){
    			for(let y = 0; y < chunk_h; y++){
    
	    		let x_u = offset[0] * chunk_w + x;
	    		let y_u = offset[1] * chunk_h + y;

      			let chunk_index = y * chunk_w + x;
      			let chunk_block = map_array[chunk_index];

				

      			if(chunk_block == 1){
        
        		let edge1 = [
          			x_u, y_u, x_u + 1, y_u
        		]
        		let edge2 = [
          			x_u + 1, y_u, x_u + 1, y_u + 1
        		]
        		let edge3 = [
          			x_u + 1, y_u + 1, x_u, y_u + 1
        		]
        		let edge4 = [
          			x_u, y_u + 1, x_u, y_u
        		]
        		edges.push(edge1)
        		edges.push(edge2)
        		edges.push(edge3)
        		edges.push(edge4)
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
]
let render = [];

let player_pos = [2, 2];

let direction = [0, 0];
let speed = 0.05;
let rot = 0;Math.PI;
let rot_speed = 3;
let rot_dir = 0;
let view_cone_slope = 1 

PI = Math.PI;

let cos = x => Math.cos(x);
let sin = x => Math.sin(x);

function walk(){
  
  rot = rot - rot_dir * PI/180 * rot_speed
 

  let prev_pos = player_pos;
  let walk_dir = [
    direction[0] * cos(rot) + direction[1] * -sin(rot),
    direction[0] * sin(rot) + direction[1] * cos(rot)
  ]
  
  player_pos = [
    player_pos[0] + speed * walk_dir[0],
    player_pos[1] + speed * walk_dir[1]
  ]

	//to check for collision we first need to load in the data of the current chunk were in
	let map_array = chunks[chunk_pos[1] + chunk_offset[1]][chunk_pos[0] + chunk_offset[0]]
	


	
	let ccx = player_pos[0] % chunk_w;
	let ccy = player_pos[1] % chunk_h;

	ccx = (ccx < 0) ? chunk_w + ccx : ccx
	ccy = (ccy < 0) ? chunk_w + ccy : ccy

	chunk_coords = [
		ccx, 
		ccy
	]

	//then we check if the player hits something inside the current chunk
	//(relative to it)
  let index = Math.floor(ccx) * chunk_w+ Math.floor(ccy)
  
  if(map_array[index] == 1){
    player_pos = prev_pos
	  return
  }

	let new_chunk_pos = [
		Math.floor(player_pos[0]/chunk_w),
		Math.floor(player_pos[1]/chunk_h)
	]

	

	if(chunk_pos[0] == new_chunk_pos[0] && chunk_pos[1] == new_chunk_pos[1]){
		return
		chunk_pos = new_chunk_pos
	}

	
	chunk_pos = new_chunk_pos



	loaded_chunks = load_chunks();
	edges = [];
	create_map();



}

let LEFT_ARROW = 

document.addEventListener("keydown", e => {
	let key = e.key;
	let keyCode = e.keyCode;

	  if(key == "ArrowLeft"){
    rot_dir = -1
  }if(key == "ArrowRight"){
    rot_dir = 1
  }
  if(key == "w"){
    direction[1] = 1;
  }if(key == "a"){
    direction[0] = -1;
  }if(key == "s"){
    direction[1] = -1;
  }if(key == "d"){
    direction[0] = 1;
  }
})


document.addEventListener("keyup", e => {
	let key = e.key;
	let keyCode = e.keyCode;
  if(key == "ArrowLeft"){
    rot_dir = 0
  }if(key == "ArrowRight"){
    rot_dir = 0
  }
    if(key == "w"){
    direction[1] = 0;
  }if(key == "a"){
    direction[0] = 0;
  }if(key == "s"){
    direction[1] = 0;
  }if(key == "d"){
    direction[0] = 0;
  }
})




function render_edges(edges){
  let [px, py] = player_pos;
  let csx = cos(rot);
  let snx = sin(rot);
  for(let i = 0; i < edges.length; i++){
    let edge = edges[i];
    
    let [
      lx, ly,
      rx, ry
    ] = edge;
    
    [lx, ly, rx, ry] = [lx - px, ly - py, rx - px, ry - py];
	
	  let rel = [
		  [lx, ly],
		  [rx, ry]
	  ]

    let [x_l, z_l] = [lx * csx + ly * snx, lx * -snx + csx * ly];
    let [x_r, z_r] = [rx * csx + ry * snx, rx * -snx + csx * ry];


	
	    const near = 0.1; // Small positive value to avoid clipping at z = 0
    if (z_l < near && z_r < near) {
      // Both points are behind the near plane, discard edge
      continue;
    }

    if (z_l < near || z_r < near) {
      // Clip the edge to the near plane
      const t = z_l < near
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

	  
    let area = (z_l + z_r)/2;
    
    let data = [x_l, x_r, z_l, z_r];
    
    render = insertIntoSortedArray(render, {data, area, face : edge})
    
    
  }
  render.reverse().forEach(({data}) => {
    let [x_l, x_r, z_l, z_r] = data
    
    //fix this so all faces are rendered....	

		



      
   	ctx.beginPath(); 
      ctx.moveTo(x_l/z_l * w/2 + w/2, h/2 + 1/z_l/2 * h/2)
      ctx.lineTo(x_l/z_l * w/2 + w/2, h/2 - 1/z_l/2 * h/2)
      ctx.lineTo(x_r/z_r * w/2 + w/2, h/2 - 1/z_r/2 * h/2)
     	ctx.lineTo(x_r/z_r * w/2 + w/2, h/2 + 1/z_r/2 * h/2)
      
      ctx.lineTo(x_l/z_l * w/2 + w/2, h/2 + 1/z_l/2 * h/2)
	ctx.fillStyle = "red"	
	ctx.fill();
	ctx.stroke()
  })
}


loaded_chunks = load_chunks();


create_map()

let fps = 60;



setInterval(() => {

  render = [];
	ctx.clearRect(0, 0, w, h)
  walk()
  render_edges(edges)
}, 1000/fps)

