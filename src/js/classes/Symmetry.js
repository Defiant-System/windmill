
class Symmetry {
	constructor(type, width, height) {
		this.type = type;
		this.width = width;
		this.height = height;
	}

	reflectPoint(coord) {
		if (this.type == SymmetryType.HORIZONTAL) {
			return {i: this.width - coord.i, j: coord.j};
		} else if (this.type == SymmetryType.VERTICAL) {
			return {i: coord.i, j: this.height - coord.j};
		} else if (this.type == SymmetryType.ROTATIONAL) {
			return {i: this.width - coord.i, j: this.height - coord.j};
		} else {
			throw Error(this.type);
		}
	}

	reflectDelta(delta) {
		// Avoid introducing negative zero here.
		var negate = n => n == 0 ? n : -n;
		
		if (this.type == SymmetryType.HORIZONTAL) {
			return {di: negate(delta.di), dj: delta.dj};
		} else if (this.type == SymmetryType.VERTICAL) {
			return {di: delta.di, dj: negate(delta.dj)};
		} else if (this.type == SymmetryType.ROTATIONAL) {
			return {di: negate(delta.di), dj: negate(delta.dj)};
		} else {
			throw Error(this.type);
		}
	}
}
