
class Vector {
	constructor(x, y) {
		this.x = x || 0;
		this.y = y || 0;
	}

	set(x, y) {
		if (typeof x === "object") {
			y = x.y;
			x = x.x;
		}
		this.x = x || 0;
		this.y = y || 0;
		return this;
	}

	add(vector) {
		this.x += vector.x;
		this.y += vector.y;
        return this;
	}

	sub(vector) {
		this.x -= vector.x;
		this.y -= vector.y;
        return this;
	}

	multiply(vector) {
		if (typeof vector === "number") {
			this.x *= vector;
			this.y *= vector;
		} else {
			this.x *= vector.x;
			this.y *= vector.y;
		}
        return this;
	}

	divide(vector) {
		if (typeof vector === "number") {
			this.x /= vector;
			this.y /= vector;
		} else {
			this.x /= vector.x;
			this.y /= vector.y;
		}
        return this;
	}

	scale(s) {
		this.x *= s;
		this.y *= s;
        return this;
	}

    angle() {
        return Math.atan2(this.y, this.x);
    }

	normalize() {
		var m = this.magnitude();
		if (m > 0) {
			this.divide(m);
		}
        return this;
	}

	magnitude() {
		var x = this.x,
			y = this.y;
		return Math.sqrt(x * x + y * y);
	}

	limit(high) {
		if (this.magnitude() > high) {
			this.normalize();
			this.multiply(high);
		}
	}

	clone() {
		return new Vector(this.x, this.y);
	}

	distanceTo(vector) {
		return Math.sqrt(this.distanceToSquared(vector));
	}

	distanceToSquared(vector) {
		var dx = vector.x - this.x,
			dy = vector.y - this.y;
		return dx * dx + dy * dy;
	}

	static reflect(n, v) {
		let d = 2 * this.dot(v, n);
		v.x -= d * n.x;
		v.y -= d * n.y;
		return v;
	}

	static subtract(v1, v2) {
		return new Vector(v1.x - v2.x, v1.y - v2.y);
	}

	static dot(v1, v2) {
		return v1.x * v2.x + v1.y * v2.y;
	}

	static getNormal(a) {
		return {
			x: Math.sin(a),
			y: -Math.cos(a)
		}
	}
}
