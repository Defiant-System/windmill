
class TetrisState {
	constructor(vals, grid) {
		// Map from shape key to list of orientations.
		this.shapeOrientations = {};
		// State is: list of remaining shapes (including their orientations)
		this.gridProgressByKey = {};
		this.gridProgressTransitions = {};
		this.reverseGridProgressTransitions = {};
		this.statesById = {};
		this.grid = grid;
		Shape.setMultiple(grid);
		// All shape information.
		// this.gridCount = goog.array.count(grid.grid, goog.functions.identity);
		this.gridCount = grid.grid.length;
		this.positive = [];
		this.negative = [];
		this.positiveCount = 0;
		this.negativeCount = 0;
		this.shapeLocations = {};
		this.stateId = 100;
		// To debug polyominos: 0 for nothing, 1 for success, 2 for all.
		this.logLevel = 0;

		vals.forEach(function(val) {
			var shape = val.cell.shape;
			// var count = goog.array.count(shape.grid, goog.functions.identity);
			var count = shape.grid.length;
			var repr = {
				grid: shape.grid,
				width: shape.width,
				height: shape.grid.length / shape.width
			};
			Shape.setMultiple(repr);
			if (shape.free) {
				repr = this.registerFreeShape(repr);
			}
			this.shapeLocations[Keys.fullShapeKey(repr)] = val;
			if (shape.negative) {
				this.negative.push(repr);
				this.negativeCount += count;
			} else {
				this.positive.push(repr);
				this.positiveCount += count;
			}
		}, this);
		var safetyScore = function(s) {
			// How safe to try out first?
			// i.e. Prunes the most future options to try sooner.
			// Score: Size * Number of cc / Number of orientations
			return (s.width*s.height) * (s.multiple ? 2 : 1) /
					(s.index ? s.index + 1 : 1);
		}
		var safestFirst = function(s1, s2) {
			return safetyScore(s2) - safetyScore(s1);
		};
		this.positive.sort(safestFirst);
		this.negative.sort(safestFirst);
		// Some pathological situation avoiding.
		this.startTime = new Date();
	}

	timedOut() {
		return !this.logLevel && new Date() - this.startTime > 4*1000;
	}

	printSearch(end) {
		var key = end;
		var i = 100;
		var remainingShapes = function(shapes) {
			return shapes.map(function(remain) {
				var height = remain.grid.length / remain.width;
				return remain.width + 'x' + remain.height + ' ' +
						remain.grid.map(function(r) { return 0 + r; });
			}).join(', ');
		}
		while (key && i-- > 0) {
			var state = this.gridProgressByKey[key];
			console.log('State ' + state.stateId + ' ============== ' + state.index);
			console.log('----- Grid');
			Shape.print(state.grid);
			console.log('Remaining: ' + remainingShapes(state.remaining));
			console.log('----- Negative grid');
			if (state.negativeGrid) {
				Shape.print(state.negativeGrid);
			}
			if (state.negative.length) {
				console.log('Remaining: ' + remainingShapes(state.negative));
			}
			key = this.reverseGridProgressTransitions[key];
		}
	}

	registerGridProgressTransition(from, tos) {
		this.gridProgressTransitions[from] = tos;
		if (!this.logLevel) {
			return;
		}
		tos.forEach(function(to) {
			this.reverseGridProgressTransitions[to] = from;
		}, this);
	}

	registerGridProgressKey(state) {
		var key = Keys.multiShapeKey(state.grid, state.remaining, state.negative, state.negativeGrid);
		state.key = key;
		if (this.logLevel) {
			state.stateId = this.stateId++;
			this.statesById[state.stateId] = key;
		}
		if (!(key in this.gridProgressByKey)) {
			this.gridProgressByKey[key] = state;
		}
		return key;
	}

	rotateClockwise(grid, width) {
		// Static utility function, could move to shape.js
		var height = grid.length / width;
		var newGrid = Array(grid.length);
		var index = 0;
		// Read up from bottom left.
		for (var i = 0; i < width; i++) {
			for (var j = width * (height - 1) + i; j >= 0; j -= width) {
				newGrid[index++] = grid[j];
			}
		}
		return newGrid;
	}

	registerFreeShape(originalShape) {
		var originalKey = Keys.shapeKey(originalShape);
		if (originalKey in this.shapeOrientations) {
			var orient = this.shapeOrientations[originalKey];
			return orient[0];
		}
		var orientationSet = {};
		orientationSet[originalKey] = originalShape;
		var curShape = originalShape;
		for (var index = 0; index < 3; index++) {
			var newGrid = this.rotateClockwise(curShape.grid, curShape.width);
			curShape = {height: curShape.width, width: curShape.height, grid: newGrid};
			var newKey = Keys.shapeKey(curShape);
			if (!(newKey in orientationSet)) {
				orientationSet[newKey] = curShape;
			}
		}
		var orientations = [];
		Object.keys(orientationSet).map(key => {
			let shape = orientationSet[key];
			this.shapeOrientations[key] = orientations;
			orientations.push(shape);
			shape.multiple = originalShape.multiple;
			shape.free = true;
		});
		return orientations[0];
	}

	getValidationAttempts(expectedErrors) {
		var attempts = [];
		if (expectedErrors == 0 || expectedErrors > 1) {
			attempts.push(new TetrisValidationAttempt(
						this.positive,
						this.negative,
						this.positiveCount,
						this.negativeCount));
		} else {
			// This should really be recursive (urg) for >1 case
			var pos = uniqueShapes(this.positive);
			goog.array.forEach(pos.uniqueShapes, function(shape) {
				var count = goog.array.count(shape.grid, goog.functions.identity);
				attempts.push(new TetrisValidationAttempt(
							pos.removeFn(shape),
							this.negative,
							this.positiveCount - count,
							this.negativeCount,
							[this.shapeLocations[Keys.fullShapeKey(shape)]]));
			}, this);
			var neg = uniqueShapes(this.negative);
			goog.array.forEach(neg.uniqueShapes, function(shape) {
				var count = goog.array.count(shape.grid, goog.functions.identity);
				attempts.push(new TetrisValidationAttempt(
							this.positive,
							neg.removeFn(shape),
							this.positiveCount,
							this.negativeCount - count,
							[this.shapeLocations[Keys.fullShapeKey(shape)]]));
			}, this);
		}
		return attempts;
	}

	getStartState(attempt) {
		var grid = this.grid;
		var negativeGrid = null;
		if (attempt.positive == attempt.negative) {
			grid = {grid: [], width: 0, height: 0};
			negativeGrid = {grid: [], width: 0, height: 0};
		}
		var startNode = {
				grid: grid,
				remaining: attempt.positive,
				negative: attempt.negative,
				negativeGrid: negativeGrid,
		};
		this.registerGridProgressKey(startNode);
		return startNode;
	}
}

