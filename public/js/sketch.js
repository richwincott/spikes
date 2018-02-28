var socket = io();
var latency = 0;

socket.on('pong', function(ms) {
    latency = ms;
});

var player;
var players = [];
var scores = [];
var nickname = prompt("Enter a nickname...");
var spikes = {
	right: [],
	left: []
};
var started = false;
var logoImage;
var birdUpImage;
var birdDownImage;
var birdDeadImage;

socket.on("joined", function (data) {
	player = new Player(data.id, data.x, data.y, data.nickname, data.scale, data.alive);
});

socket.on("player left", function (data) {
	for (var i = players.length-1; i >= 0; i--) {
		if (players[i].id = data)
			players.splice(i, 1);
	}
});

socket.on("scores updated", function (data) {
	scores = data;
	console.log(scores);
})

socket.on("new player connected", function (data) {
	var player = new Player(data.id, data.x, data.y, data.nickname, data.scale, data.alive)
	players.push(player);
}); 

socket.on("heartbeat", function (data) {
	for (var i = 0; i < data.length; i++)
	{
		for (var j = 0; j < players.length; j++)
		{
			if (data[i].id == players[j].id) {
				players[j].pos.lerp(data[i].x, data[i].y, 0, 0.2);
				players[j].angle = data[i].angle;
				players[j].scale = data[i].scale;
				players[j].alive = data[i].alive;
			}
		}
	}
}); 

function setup() { 
	createCanvas(500, 700);
	angleMode(DEGREES);
	rectMode(CENTER);
	
	logoImage = loadImage("assets/logo.png");
	birdUpImage = loadImage("assets/bird_up.png");
	birdDownImage = loadImage("assets/bird_down.png");
	birdDeadImage = loadImage("assets/bird_dead.png")

	var data = {
		x: width/2,
		y: height/2,
		nickname: nickname,
		scale: 1,
		alive: true
	}
	socket.emit("join", data);

	generateSpikes("right");
	generateSpikes("left");	
}

function generateSpikes(side) {
	if (side == "right") {
		spikes.right = [];
		for (var i = 0; i < random(6, 10); i++) {
			spikes.right.push(new Spike(width-2, random(20, height - 30), 45));
		}
	}
	else if (side == "left") {
		spikes.left = [];
		for (var i = 0; i < random(6, 10); i++) {
			spikes.left.push(new Spike(2, random(20, height - 30), 45));
		}
	}
}

function keyPressed() {
	if (player.alive) {
		if (key == ' ') {
			player.jump();			
		}
	}
}

function mousePressed() {
	player.pos = createVector(width/2, height/2);
	player.score = 0;
	player.alive = true;
	started = true;
}

function draw() {
	background(245, 245, 245);	

	strokeWeight(2);
	stroke(200, 200, 200);
	for (var i = 0; i < 11; i++) {
		push();
		fill(200, 200, 200);
		noStroke();
		translate(50*i, height-2);
		rotate(45);
		rect(0, 0, 30, 30);
		pop();
	}

	fill(200, 200, 200);
	for (var i = 0; i < spikes.right.length; i++) {
		spikes.right[i].show();
	}
	for (var i = 0; i < spikes.left.length; i++) {
		spikes.left[i].show();
	}

	if (player) {
		player.show();
		player.update();
		player.constrain();
		player.bounce();
		player.collision();

		noStroke();
		fill(40);
		textAlign(RIGHT);
		text(player.score, width-40, 30);

		if (started && player.alive == false) {
			textAlign(CENTER);
			image(logoImage, width/2 - 112, height/2 - 205);
			text("You died!", width/2, height/2 - 100);
			text("Your score: " + player.score, width/2, height/2 - 70);
			text("Click to restart", width/2, height/2 - 25);
			text("Leaderboard", width/2, height/2 + 80);
			for (var i = 0; i < scores.length; i++) {
				text(scores[i].nickname + ": " + scores[i].score, width/2, height/2 + ((i+5)*25));
			}
		}

		if (started == false && player.alive == true) {
			textAlign(CENTER);
			image(logoImage, width/2 - 112, height/2 - 205);
			text("Click your mouse to start", width/2, height/2 - 100);
			text("Space bar to jump", width/2, height/2 - 70);
			text("Leaderboard", width/2, height/2 + 80);
			for (var i = 0; i < scores.length; i++) {
				text(scores[i].nickname + ": " + scores[i].score, width/2, height/2 + ((i+5)*25));
			}
		}

		var data = {
			id: player.id,
			x: player.pos.x,
			y: player.pos.y,
			scale: player.scale,
			alive: player.alive
		}
		socket.emit("move", data);
	}

	for (var i = 0; i < players.length; i++) {
		players[i].show();
	}


	
	

	noStroke();
	fill(40);
	textAlign(LEFT);
	text(latency + " ms", 40, 30); 
}

$(window).on('beforeunload', function(){
	socket.emit('leave', player.id);
});