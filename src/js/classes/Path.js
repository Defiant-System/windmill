
class Path {
	constructor(coords, width, height, opt_newPaths) {
		// TODO: Also take in a grid shape, to enable non-standard grids.
		this.coords = coords;
		this.coordsMap = {};
		// goog.array.toObject(coords, coordKey);
		coords.map(e => this.coordsMap[keys.coordKey(e)] = e);

		var lines = [];
		for (var i = 1; i < coords.length; i++) {
			if (opt_newPaths && opt_newPaths.includes(i)) {
				continue;
			}
			var c1 = coords[i-1];
			var c2 = coords[i];
			lines.push({
				i: Math.min(c1.i, c2.i),
				j: Math.min(c1.j, c2.j), isDown: c1.i == c2.i
			});
		}
		this.lines = lines;
		this.linesMap = {};
		// this.linesMap = goog.array.toObject(lines, lineKey);
		lines.map(e => this.linesMap[keys.lineKey(e)] = e);

		this.width = width;
		this.height = height;
	}

	makeGroupings(opt_startCoords, opt_skipFinalize) {
		var allCoords = {};
		for (var i = 0; i < this.width; i++) {
			for (var j = 0; j < this.height; j++) {
				var coord = {i: i, j: j};
				allCoords[keys.coordKey(coord)] = new GroupingDisjointSet(coord, allCoords);
			}
		}
		var startCoords = null;
		if (opt_startCoords) {
			startCoords = {};
			// goog.array.toObject(opt_startCoords, coordKey);
			opt_startCoords.map(e => startCoords[keys.coordKey(e)] = e);
		}
		var searchCoords = startCoords == null
						? allCoords
						: startCoords.map((coord, key) => allCoords[key]);

		// goog.object.forEach(searchCoords, function(start) {
		Object.keys(searchCoords).map(key => {
			let start = searchCoords[key];

			if (!start) {
				// Can happen if a start coord is out of bounds, which is allowed.
				return;
			} 
			var queue = [start.data.seed];
			while (queue.length) {
				var coord = queue.pop();
				var group = allCoords[keys.coordKey(coord)];
				if (group.visited) {
					continue;
				}
				group.visited = true;
				var texts = [];
				this.getNeighbors(coord).forEach(function(neighbor) {
					queue.push(neighbor);
					var neighborGroup = allCoords[keys.coordKey(neighbor)];
					group.union(neighborGroup);
				})
			}
		}, this);
		var groupMap = {};
		var totalCount = {};
		// allCoords.forEach(function(group) {
		Object.keys(allCoords).map(k => {
			let group = allCoords[k];
			var key = keys.coordKey(group.data.seed);
			if (group.data.count && !(key in groupMap) && (key in searchCoords)) {
				if (!opt_skipFinalize) {
					group.data.finalize();
				}
				groupMap[key] = group.data;
			}
			totalCount[key] = group.data.count;
		});
		for (var j = 0; j < this.height; j++) {
			var s = [];
			for (var i = 0; i < this.width; i++) {
				coord = {i: i, j: j};
				s.push(allCoords[keys.coordKey(coord)].getSeed());
			}
			//console.log(j + ' >' + s.join('') + '<');
		}
		// return goog.object.getValues(groupMap);
		return Object.values(groupMap);
	}

	groupingIncludes(group, coord, drawType) {
		var width = this.width, height = this.height;
		// Assumption: At least one call to cell is a coord that exists.
		// All groupings trivially include out-of-bounds points, otherwise.
		var cell = function(di, dj) {
			return (keys.coordKey({i: coord.i+di, j:coord.j+dj}) in group.coords) ||
					coord.i + di < 0 || coord.j + dj < 0 ||
					coord.i + di >= width || coord.j + dj >= height;
		}
		if (drawType == DrawType.CELL) {
			return cell(0, 0);
		} else if (drawType == DrawType.POINT) {
			return cell(0, 0) && cell(-1, 0) && cell(0, -1) && cell(-1, -1);
		} else if (drawType == DrawType.HLINE) {
			return cell(0, 0) && cell(0, -1);
		} else if (drawType == DrawType.VLINE) {
			return cell(0, 0) && cell(-1, 0);
		} else {
			return false;
		}
	}

	getNeighbors(c) {
		var vertical = true;
		var horizontal = false;
		var neighbors = [];
		// Left
		if (c.i > 0 && !this.hasLine(c.i, c.j, vertical)) {
			neighbors.push({i: c.i-1, j: c.j});
		}
		// Right
		if (c.i < this.width-1 && !this.hasLine(c.i+1, c.j, vertical)) {
			neighbors.push({i: c.i+1, j: c.j});
		}
		// Up
		if (c.j > 0 && !this.hasLine(c.i, c.j, horizontal)) {
			neighbors.push({i: c.i, j: c.j-1});
		}
		// Down
		if (c.j < this.height-1 && !this.hasLine(c.i, c.j+1, horizontal)) {
			neighbors.push({i: c.i, j: c.j+1});
		}
		return neighbors;
	}

	hasLine(i, j, isDown) {
		return keys.lineKey({i: i, j: j, isDown: isDown}) in this.linesMap;
	}

}
