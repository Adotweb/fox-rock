const { WebSocketServer } = require("ws");
const { GameState } = require("./game_state/game_state");
const crypto = require("crypto");

const express = require("express")
const app = express()
const server = require("http").createServer(app)

const cors = require("cors");
const { ServerGroup } = require("./server_group");

app.use(express.json())

app.use(cors())


const wss = new WebSocketServer({ path : "/", server })


let main_server_group = new ServerGroup("/");

let groups = new Map();


wss.on("connection", socket => {

	socket.first_connection = true;
	
	socket.on("message", proto => {
		try{	
			let data = JSON.parse(proto.toString());
		

			if(!data.group_id){
				main_server_group.new_connection(socket)

				main_server_group.message_listener(data, socket.id)

			}else {
			
				if(groups.has(data.group_id)){
								
					let group = groups.get(data.group_id);
					group.new_connection(socket)
					group.message_listener(data, socket.id)
				}else {
					socket.send(JSON.stringify({
						success : "false",
						message : "there is no group with this id"
					}))
				}

			}
		}catch{}
	})
		

})



const updates_per_second = 40

setInterval(() => {
	try {
		main_server_group.update();
	}catch{}
	[...groups.values()].forEach(group => {try {group.update() }catch{}})

}, 1000/updates_per_second)


app.get("/get_rooms", (req, res) => {

	res.send({
		success : true, 
		rooms : [...groups.keys()]
	})

})


app.post("/create_room", (req, res) => {
	let { maybe_id } = req.body;

	try {
		let actual_id = maybe_id;
		if(!groups.has(maybe_id)){
			let new_group = new ServerGroup(maybe_id, groups);


			groups.set(maybe_id, new_group)
		}else {
			let new_group = new ServerGroup(crypto.randomUUID(), groups);
			groups.set(new_group.group_id, new_group)

			actual_id = new_group.group_id;
		}


		res.send({
			group_id : actual_id, 
			success : true
		})

	}catch(e){

	}	
})

setInterval(() => {
  const memoryUsage = process.memoryUsage();
  console.log({
    rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`, // Resident Set Size
    heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`, // Total size of allocated heap
    heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`, // Actual memory used on the heap
    external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`, // Memory for C++ objects
  });
}, 1000);

server.listen(process.env.PORT || 3000)
