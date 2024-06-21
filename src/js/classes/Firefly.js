
class Firefly {
	constructor(parent, data, color) {
		this._parent = parent;

		this.orbit = 15;
		this.color = color;
		this.target = new Vector(parent.target.x, parent.target.y);
		this.velocity = new Vector(Math.cos(data.normal), Math.sin(data.normal)).scale(5);
		this.pos = new Vector(data.x, data.y);
	}

	update() {
		if (this.pos.distanceTo(this.target) < 5) {
			return this._parent.remove(this);
		}

		let move = this.target.clone(),
			dir = Vector.subtract(move, this.pos);
		dir.normalize();
		dir.multiply(.85);

		this.orbit *= .985;
		this.velocity.add(dir);
		this.velocity.limit(this.orbit);
		this.pos.add(this.velocity);
	}

	render(ctx) {
		ctx.drawImage(this.color.img, this.pos.x - this.color.w, this.pos.y - this.color.w)
	}
}
