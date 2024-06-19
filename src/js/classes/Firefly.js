
class Firefly {
	constructor(x, y, tx, ty) {
		this.orbit = 5;
		this.radius = 3;
		this.TAU = Math.PI * 2;

		this.pos = new Point(x, y);
		this.target = new Point(tx, ty);
		this.velocity = new Vector(0, 0);
	}

	update() {
		
	}

	render(ctx) {
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, this.radius, 0, this.TAU);
		ctx.fill();
	}
}
