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





function create_map(){
  
  for(let x = 0; x < chunk_w; x++){
    for(let y = 0; y < chunk_h; y++){
      
      let chunk_index = y * chunk_w + x;
      
      let chunk_block = map_array[chunk_index];
      if(chunk_block == 1){
        
        let edge1 = [
          x, y, x + 1, y
        ]
        let edge2 = [
          x + 1, y, x + 1, y + 1
        ]
        let edge3 = [
          x + 1, y + 1, x, y+ 1
        ]
        let edge4 = [
          x, y + 1, x, y
        ]
        edges.push(edge1)
        edges.push(edge2)
        edges.push(edge3)
        edges.push(edge4)
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
  
  let index = Math.floor(player_pos[1]) * chunk_w+ Math.floor(player_pos[0])
  
  if(map_array[index] == 1){
    player_pos = prev_pos
  }


	chunk_pos = [
		Math.floor(player_pos[0]/chunk_w),
		Math.floor(player_pos[1]/chunk_h)
	]
	
	let ccx = player_pos[0] % chunk_w;
	let ccy = player_pos[1] % chunk_h;

	ccx = (ccx < 0) ? chunk_w + ccx : ccx
	ccy = (ccy < 0) ? chunk_w + ccy : ccy

	chunk_coords = [
		ccx, 
		ccy
	]

	

	console.log(chunk_pos, chunk_coords)

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

create_map()

let fps = 60;

setInterval(() => {

  render = [];
	ctx.clearRect(0, 0, w, h)
  walk()
  render_edges(edges)
}, 1000/fps)


