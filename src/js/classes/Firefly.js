
class Firefly {
	constructor(parent, data) {
		this._parent = parent;

		this.orbit = 15;
		this.radius = 2;
		this.TAU = Math.PI * 2;

		this.normal = data.normal;
		this.friction = .95;
		this.speed = 1.25;
		this.mode = "expand";

		this.target = new Vector(-100, -200);
		// this.velocity = new Vector(-5, 3);

		this.dir = new Vector(Math.cos(this.normal), Math.sin(this.normal));
		this.pos = new Vector(data.x, data.y);
	}

	update() {
		if (this.orbit < 3) {
			this.mode = "home";
		}

		switch (this.mode) {
			case "home":
				return this._parent.remove(this);
			case "seek":
				let move = this.target.clone(),
					dir = Vector.subtract(move, this.pos);

				dir.normalize();
				dir.multiply(.75);

				this.orbit *= .99;
				this.velocity.add(dir);
				this.velocity.limit(this.orbit);
				this.pos.add(this.velocity);
				break;
			case "expand":
				this.speed *= this.friction;
				this.dir.multiply(new Vector(this.speed, this.speed));
				this.pos.add(this.dir);
				// expand done - now seek "star"
				if (this.speed < .75) {
					this.velocity = this.dir.clone().scale(4);
					this.mode = "seek";
				}
				break;
		}
	}

	render(ctx) {
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, this.radius, 0, this.TAU);
		ctx.fill();


		// let { x, y } = Utils.getXYFromRadAngle(10, this.normal);

		// ctx.strokeStyle = "#00f";
		// ctx.beginPath();
		// ctx.moveTo(this.pos.x, this.pos.y);
		// ctx.lineTo(this.pos.x + x, this.pos.y + y);
		// ctx.stroke();
	}
}
