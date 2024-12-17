const { WebSocketServer } = require("ws");
const { GameState } = require("./game_state/game_state");
const crypto = require("crypto");
const { HostedServer } = require("./single_server");

const app = require("express")()
const server = require("http").createServer(app)


const connections = new Map();


let hosted = new HostedServer(server, "/");

const updates_per_second = 40

setInterval(() => {

	hosted.update_server();

}, 1000/updates_per_second)


server.listen(process.env.PORT || 3000)
