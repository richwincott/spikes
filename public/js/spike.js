function Spike(x, y, angle) {
    this.pos = createVector(x, y);
    this.angle = angle;

    this.show = function() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.angle);
        rect(0, 0, 30, 30);
        pop();
    }
}