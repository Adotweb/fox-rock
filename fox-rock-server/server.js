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

groups.set("/", main_server_group)

wss.on("connection", socket => {

	socket.first_connection = true;
	
	socket.on("message", proto => {
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
	})

})



const updates_per_second = 40

setInterval(() => {
	[...groups.values()].forEach(group => group.update())

}, 1000/updates_per_second)


app.get("/get_rooms", (req, res) => {

	res.send({
		success : true, 
		rooms : [...groups.keys()]
	})

})

app.post("/delete_room", (req, res) => {

})

app.post("/create_room", (req, res) => {
	let { maybe_id } = req.body;

	console.log(req.body)

	let actual_id = maybe_id;
	if(!groups.has(maybe_id)){
		let new_group = new ServerGroup(maybe_id);


		groups.set(maybe_id, new_group)
	}else {
		let new_group = new ServerGroup(crypto.randomUUID());
		groups.set(new_group.group_id, new_group)

		actual_id = new_group.group_id;
	}


	res.send({
		group_id : actual_id, 
		success : true
	})
	
})


server.listen(process.env.PORT || 3000)
