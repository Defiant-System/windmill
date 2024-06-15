
class Grouping {
	constructor(coord) {
		this.coords = {};
		this.coords[Keys.coordKey(coord)] = coord;
		this.seed = coord;
		this.count = 1;
		this.topLeft = null;
		this.bottomRight = null;
		this.width = -1;
		this.height = -1;
		this.shape = null;
	}

	finalize() {
		if (this.count == 0) {
			throw Error();
		}
		// TODO: Dependency on shape. Shouldn't this logic be in shape anyway?
		var is = [];
		var js = [];
		// this.coords.forEach(function(coord) {
		Object.keys(this.coords).map(k => {
			let coord = this.coords[k];
			is.push(coord.i);
			js.push(coord.j);
		});
		var minc = this.topLeft =
				{i: Math.min.apply(null, is), j: Math.min.apply(null, js)};
		var maxc = this.bottomRight =
				{i: Math.max.apply(null, is), j: Math.max.apply(null, js)};
		this.width = maxc.i - minc.i + 1;
		this.height = maxc.j - minc.j + 1;
		var grid = [];
		for (var j = 0; j < this.height; j++) {
			for (var i = 0; i < this.width; i++) {
				grid.push(Keys.coordKey({i: minc.i+i, j: minc.j+j}) in this.coords);
			}
		}
		this.shape = {grid: grid, width: this.width, height: this.height};
	}
}
