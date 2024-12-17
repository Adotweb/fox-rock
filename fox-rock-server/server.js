const { WebSocketServer } = require("ws");
const { GameState } = require("./game_state/game_state");
const crypto = require("crypto");
const { HostedServer } = require("./single_server");

const express = require("express")
const app = express()
const server = require("http").createServer(app)


app.use(express.json())

const connections = new Map();


let main_server = new HostedServer(server, "");


let hosted_servers = new Map()

const updates_per_second = 40

setInterval(() => {
	//update the main room
	main_server.update_server();

	[...hosted_servers.values()].forEach(hosted_server => {
		hosted_server.update_server();
	})
	

}, 1000/updates_per_second)


app.get("/get_rooms", (req, res) => {

	res.send(
		[...hosted_servers.keys()].map(s => `<div>${s}</div>`).join("")
	)

})

app.post("/delete_room", (req, res) => {
	let { server_id } = req.body

	hosted_servers.delete(server_id)

	res.send({
		success : true
	})
})

app.post("/create_room", (req, res) => {
	
	let { maybe_path } = req.body

	if(!hosted_servers.has(maybe_path)){
		let new_server = new HostedServer(server, maybe_path, hosted_servers);
		hosted_servers.set(maybe_path, new_server)

		return res.send({
			success : true, 
			path : maybe_path
		})
	}else{
		let new_server = new HostedServer(server, crypto.randomUUID(), hosted_servers);
		hosted_servers.set(new_server.id, new_server)

		return res.send({
			success : true, 
			path : new_server.id
		})
	}
})


server.listen(process.env.PORT || 3000)
