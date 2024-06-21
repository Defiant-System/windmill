
class Firefly {
	constructor(parent, data) {
		this._parent = parent;

		this.orbit = 15;
		this.speed = 1.25;
		this.mode = "expand";

		this.target = new Vector(parent.target.x, parent.target.y);
		this.dir = new Vector(Math.cos(data.normal), Math.sin(data.normal));
		this.pos = new Vector(data.x, data.y);
	}

	update() {
		if (this.pos.distanceTo(this.target) < 5) {
			this.mode = "home";
		}

		switch (this.mode) {
			case "home":
				return this._parent.remove(this);
			case "seek":
				let move = this.target.clone(),
					dir = Vector.subtract(move, this.pos);

				dir.normalize();
				dir.multiply(.85);

				this.orbit *= .985;
				this.velocity.add(dir);
				this.velocity.limit(this.orbit);
				this.pos.add(this.velocity);
				break;
			case "expand":
				this.speed *= .9725;
				this.dir.multiply(new Vector(this.speed, this.speed));
				this.pos.add(this.dir);
				// expand done - now seek "star"
				if (this.speed < .8) {
					this.velocity = this.dir.clone().scale(5);
					this.mode = "seek";
				}
				break;
		}
	}

	render(ctx) {
		// ctx.beginPath();
		// ctx.arc(this.pos.x, this.pos.y, 2, 0, Math.PI * 2);
		// ctx.fill();
		ctx.drawImage(this._parent.fly, this.pos.x - 8, this.pos.y - 8)
	}
}
