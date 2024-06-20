
class Firefly {
	constructor(parent, data) {
		this._parent = parent;

		this.ttl = 40;
		this.orbit = 5;
		this.radius = 3;
		this.TAU = Math.PI * 2;

		this.normal = data.normal;
		this.dir = new Vector(Math.sin(this.normal), Math.cos(this.normal));
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


		let { x, y } = Utils.getXYFromRadAngle(10, this.normal);

		ctx.strokeStyle = "#faa";
		ctx.beginPath();
		ctx.moveTo(this.pos.x, this.pos.y);
		ctx.lineTo(this.pos.x + x, this.pos.y + y);
		ctx.stroke();
	}
}
