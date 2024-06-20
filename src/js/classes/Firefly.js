
class Firefly {
	constructor(parent, data) {
		this._parent = parent;

		this.orbit = 5;
		this.radius = 3;
		this.TAU = Math.PI * 2;

		this.ttl = 40;
		this.dir = new Vector(Math.sin(data.rad), Math.cos(data.rad));
		this.acc = new Vector(.3, .3);
		this.pos = new Vector(data.x, data.y);
	}

	update() {
		if (this.ttl-- < 0) return this._parent.remove(this);

		// this.dir.multiply(this.acc);
		this.pos.add(this.dir);
		// console.log(this.pos.x, this.pos.y);
	}

	render(ctx) {
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, this.radius, 0, this.TAU);
		ctx.fill();
	}
}