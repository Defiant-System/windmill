
class Firefly {
	constructor(parent, data) {
		this._parent = parent;

		this.ttl = 90;
		this.orbit = 5;
		this.radius = 3;
		this.TAU = Math.PI * 2;

		this.normal = data.normal;
		this.friction = .95;
		this.speed = 1.25;
		this.mode = "expand";

		this.target = new Vector(100, 100);
		this.velocity = new Vector(0, 0);

		this.dir = new Vector(Math.cos(this.normal), Math.sin(this.normal));
		this.pos = new Vector(data.x, data.y);
	}

	update() {
		if (this.ttl-- < 0) {
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

				this.velocity.add(dir);
				this.velocity.limit(this.orbit);
				this.pos.add(this.velocity);
				break;
			case "expand":
				this.speed *= this.friction;
				this.dir.multiply(new Vector(this.speed, this.speed));
				this.pos.add(this.dir);
				// expand done - now seek "star"
				if (this.speed < .75) this.mode = "seek";
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
