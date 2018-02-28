var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http, { pingInterval: 2000 });

app.use(express.static('public'))

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

var players = [];
var scores = [];

function Player(id, x, y, nickname, scale, alive) {
	this.id = id,
	this.x = x,
	this.y = y,
	this.nickname = nickname
	this.scale = scale;
	this.alive = alive;
}
 
setInterval(function () {
	io.emit("heartbeat", players);
}, 20);
 
setInterval(function () {
	console.log(" ");
	for (var i = 0; i < players.length; i++)
	{
		console.log(players[i]);
	}
}, 2000);

io.on('connection', function(socket) {	
	console.log(socket.id + ' connected');

	// send all existing players to new client
	for (var i = 0; i < players.length; i++)
	{
		socket.emit("new player connected", players[i]);
	}

	socket.emit("scores updated", scores);

	socket.on("die", function (data) {
		var found = false;
		for (var i = 0; i < scores.length; i++) {
			if (scores[i].nickname == data.nickname) {
				found = true;
				if (data.score > scores[i].score)
					scores[i].score = data.score;
			}
		}
		if (found == false) {
			scores.push(data);
		}
		io.emit("scores updated", scores); 
	});

	socket.on("join", function (data) {
		var player = new Player(socket.id, data.x, data.y, data.nickname, data.scale, data.alive);
		players.push(player);
		socket.emit("joined", player);
		socket.broadcast.emit("new player connected", player); 
	});

	socket.on('move', function (data) {
		for (var i = 0; i < players.length; i++) {
			if (players[i].id == data.id) {
				players[i].x = data.x;
				players[i].y = data.y;
				players[i].scale = data.scale;
				players[i].alive = data.alive;
			}
		}
	});

	socket.on('leave', function(id) {
		for (var i = players.length-1; i >= 0; i--) {
			if (players[i].id == id)
				players.splice(i, 1);
		}
		socket.broadcast.emit("player left", id);
		console.log(id + ' disconnected');
	});  
});

http.listen(3007, function() {
  console.log('listening on *:3007');
});