
let Keys = {
	coordKey(coord) {
		return coord.i + "," + coord.j;
	},
	coordListKey(coordList) {
		return coordList.map(Keys.coordKey).join(",");
	},
	lineKey(line) {
		return Keys.coordKey({i: line.i, j: line.j}) + "," + (line.isDown ? "v" : "h");
	},
	shapeKey(shape) {
		if (shape.key_) {
			return shape.key_;
		}
		var key = [
			shape.width,
			// goog.array.map(shape.grid, function(b) { return b ? "1" : "0" }).join("")
			shape.grid.map(b => b ? "1" : "0").join("")
		].join(",");
		shape.key_ = key;
		return key;
	},
	fullShapeKey(shape) {
		return Keys.shapeKey(shape) + (shape.free ? "f" : "") + (shape.negative ? "n" : "");
	},
	multiShapeKey(grid, remaining, negative, opt_negativeGrid) {
		var shapeListKey = function(shapes) {
			var shapeKeys = remaining.map(Keys.fullShapeKey);
			shapeKeys.sort();
			return shapeKeys.join("-");
		}
		var stateKeys = [];
		stateKeys.push(Keys.shapeKey(grid));
		stateKeys.push(shapeListKey(remaining));
		stateKeys.push(shapeListKey(negative));
		if (opt_negativeGrid) {
			stateKeys.push(Keys.shapeKey(opt_negativeGrid));
			stateKeys.push(Keys.coordKey(opt_negativeGrid.offset));
		}
		return stateKeys.join("|");
	},
};
