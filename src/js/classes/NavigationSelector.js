
class NavigationSelector {
	constructor(grid) {
		this.grid = grid;
	}

	pointIsReachable(current, di, dj) {
		var grid = this.grid;
		var thisEntity = grid.pointEntity(current.i, current.j);
		var entity = grid.pointEntity(current.i + di, current.j + dj);
		// Something's there: it's okay!
		if (entity != null) {
			var line = grid.lineBetweenEntity(current.i, current.j, current.i + di, current.j + dj);
			if (line != null) {
				if (line.type == Type.NONE) {
				// if (line.type == Type.NONE || current.i == 0 && current.j == 1 && current.i + di == 1 && current.j + dj == 1) {
					return "no";
				} else if (line.type == Type.DISJOINT) {
					return "disjoint";
				}
			}
			return "yes";
		}
		// If point is not there, we can go to the end.
		if (thisEntity.type == Type.END) {
			var o = grid.getEndPlacement(current.i, current.j);
			if (o.horizontal == di && o.vertical == dj) {
				return "end";
			}
		}
		return "no";
	}

	selectTarget(di, dj, preferHorizontal, movement, secondaryMovement) {
		var grid = this.grid;
		// Select something
		var current = movement[movement.length - 1];
		var select = {i: current.i, j: current.j};
		// First, at start, can stay still within circle.
		var result = {}
		// Determine where we can go and how far.
		var diBack, djBack;
		if (movement.length > 1) {
			var previous = movement[movement.length - 2];
			diBack = previous.i - current.i;
			djBack = previous.j - current.j;
		}
		var secondary = null;
		if (secondaryMovement) {
			var symmetry = grid.getSymmetry();
			secondary = {
				symmetry: symmetry,
				movement: secondaryMovement,
				current: secondaryMovement[secondaryMovement.length - 1]
			};
		}
		var crossesPath = function(di, dj) {
			// var blocker = goog.array.find(movement, function(coord) {
			var blocker = movement.find((coord) => {
				var targetIsCoord = coord.i == current.i + di && coord.j == current.j + dj;
				var isBacktrack = di == diBack && dj == djBack;
				return targetIsCoord ? !isBacktrack : false;
			});
			if (blocker != null) {
				return {blocker: blocker, midway: false};
			}
			if (secondary) {
				var sd = symmetry.reflectDelta({di: di, dj: dj});
				if (current.i + di == secondary.current.i + sd.di &&
						current.j + dj == secondary.current.j + sd.dj) {
					return {vertex: true, midway: true};
				}
				if (current.i + di == secondary.current.i &&
						current.j + dj == secondary.current.j) {
					return {vertex: false, midway: true};
				}
				// blocker = goog.array.find(secondary.movement, function(coord) {
				blocker = secondary.movement.find((coord) => {
					var targetIsCoord =
							coord.i == current.i + di && coord.j == current.j + dj;
					return targetIsCoord;
				});
				if (blocker != null) {
					return {blocker: blocker, midway: false};
				}
			}
			return null;
		}
		var calcProgress = function(di, dj) {
			if (di == 0 && dj == 0) {
				return "no";
			}
			// TODO: Clean this up, so length is calculated at the very
			// end and semantic meaning is preserved (e.g. for isEnd).
			var reach = this.pointIsReachable(current, di, dj);
			if (reach == "no") {
				return 0;
			} else if (reach == "end") {
				return UI.END_LENGTH;
			} else if (reach == "disjoint") {
				return UI.DISJOINT_LENGTH;
			}
			if (secondary) {
				var sd = symmetry.reflectDelta({di: di, dj: dj});
				reach = this.pointIsReachable(secondary.current, sd.di, sd.dj);
				if (reach == "no") {
					return 0;
				} else if (reach == "end") {
					return UI.END_LENGTH;
				} else if (reach == "disjoint") {
					return UI.DISJOINT_LENGTH;
				}
			}
			var cross = crossesPath(di, dj);
			if (cross) {
				var blocker = cross.blocker;
				if (blocker) {
					var point = grid.pointEntity(blocker.i, blocker.j);
					if (!point) {
						throw Error("bad element in path");
					}
					let GU = preferHorizontal ? UI.CELL_WIDTH : UI.CELL_HEIGHT;
					return point.type == Type.START ? GU - UI.START_R - (UI.GRID_LINE * .5) : GU - UI.GRID_LINE;
				} else if (cross.midway) {
					return cross.vertex ? 90 : 40;
				}
			}
			return -1;
		}
		var horizontalProgress = calcProgress.call(this, di, 0);
		var verticalProgress = calcProgress.call(this, 0, dj);
		// Optimization: Snap to line if closeby.
		// The most basic selection.
		if (horizontalProgress && verticalProgress) {
			if (preferHorizontal) {
				select.i += di;
			} else {
				select.j += dj;
			}
		} else if (horizontalProgress) {
			select.i += di;
		} else if (verticalProgress) {
			select.j += dj;
		} else {
		}
		if (select.i != current.i && horizontalProgress != -1) {
			result.maxProgress = horizontalProgress;
		}
		if (select.j != current.j && verticalProgress != -1) {
			result.maxProgress = verticalProgress;
		}
		// HACK HACK HACK
		if (result.maxProgress == UI.END_LENGTH) {
			result.isEnd = true;
		}
		result.select = select;
		return result;
	}

}
