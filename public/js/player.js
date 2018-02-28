function Player(id, x, y, nickname, scalee, alive) {
	this.id = id;
	this.nickname = nickname;
	this.pos = createVector(x, y);
	this.vel = createVector(0, 0);
	this.gravity = createVector(0, 0.8);
	this.dir = createVector(0.7, 0);
	this.angle = 0;
	this.len = 8;
	this.color = color;
	this.score = 0;
	this.alive = alive;
	this.scale = scalee;
	this.img = 1;

	this.update = function () {
		if (started) {
			this.vel.add(this.gravity);
			if (this.pos.y < height -15) {
				this.vel.add(this.dir);
			}
		}
		this.vel.mult(0.9);
		this.pos.add(this.vel);
	}

	this.jump = function () {
		if (this.alive && started) {
			var force = createVector(0, -20);
			this.vel.add(force);
			this.img = this.img * -1;
		}
	}

	this.bounce = function () {
		if (this.pos.x == width || this.pos.x == 0) {
			this.dir.mult(-1);
			this.scale = this.scale * -1;
			if (this.alive == true) {
				this.score++;
				if (this.pos.x > width /2) {
					setTimeout(function () {
						generateSpikes("right");
					}, 1000);
				}
				else {
					setTimeout(function () {
						generateSpikes("left");
					}, 1000);
				}		
			}
		}
	}

	this.collision = function () {
		if (this.alive) {
			if (this.pos.x > width - 20 || this.pos.x < 20) {
				var hitSpike = false;
				if (this.pos.x > width /2) {							
					for (var i = 0; i < spikes.right.length; i++) {
						hitSpike = player.hitsSpike(spikes.right[i]);
						if (hitSpike == true)
							return;
					}
				}
				else {
					for (var i = 0; i < spikes.left.length; i++) {
						hitSpike = player.hitsSpike(spikes.left[i]);
						if (hitSpike == true)
							return;
					}
				}			
			}
			if (this.pos.y == height - 15 && this.alive == true) {
				this.alive = false;
				var data = {
					"nickname": this.nickname,
					"score": this.score
				}
				socket.emit("die", data);
			}
		}
	}

	this.hitsSpike = function (spike) {
		if (this.pos.y < spike.pos.y + 20 && this.pos.y > spike.pos.y - 20) {
			this.alive = false;
			var data = {
				"nickname": this.nickname,
				"score": this.score
			}
			socket.emit("die", data);
			return true;
		}
		return false
	}

	this.show = function () {
		noStroke();
		fill(200);
		textAlign(CENTER);
		text(this.nickname, this.pos.x, this.pos.y-25);


		push();
		translate(this.pos.x, this.pos.y);
		scale(this.scale, 1);
		if (this.alive)
			if (this.img == 1)
				image(birdUpImage, -23, -15, birdUpImage.width/2, birdUpImage.height/2);
			else
				image(birdDownImage, -23, -15, birdUpImage.width/2, birdUpImage.height/2);
		else
			image(birdDeadImage, -23, -15, birdUpImage.width/2, birdUpImage.height/2);
		pop();
	}

	this.constrain = function () {
		this.pos.x = constrain(this.pos.x, 0, width);
		this.pos.y = constrain(this.pos.y, 15, height - 15);
		if (this.pos.x == width || this.pos.x == 0 || this.pos.y == height || this.pos.y == 0) {
			this.vel = createVector(0, 0);
			this.acc = createVector(0, 0);
		}
	}
}