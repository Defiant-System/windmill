
class NavigationSelector {
	constructor(grid) {
		this.grid = grid;
	}

	pointIsReachable(current, di, dj) {
		let grid = this.grid;
		let thisEntity = grid.pointEntity(current.i, current.j);
		let entity = grid.pointEntity(current.i + di, current.j + dj);
		// Something's there: it's okay!
		if (entity != null) {
			let line = grid.lineBetweenEntity(current.i, current.j, current.i + di, current.j + dj);
			if (line != null) {
				// if (line.type == Type.NONE || current.i == 0 && current.j == 1 && current.i + di == 1 && current.j + dj == 1) {
				if (line.type == Type.NONE) {
					if (thisEntity.type == Type.END) {
						if (thisEntity.rotation == 0 && dj == -1) return "end-up";
						if (thisEntity.rotation == 4 && dj == 1) return "end-down";
						if (thisEntity.rotation == 6 && di == -1) return "end-left";
						if (thisEntity.rotation == 2 && di == 1) return "end-right";
					}
					return "no";
				} else if (line.type == Type.DISJOINT) {
					return (di == 1 || di == -1) ? "disjoint-w" : "disjoint-h";
				}
			}
			return "yes";
		}
		// If point is not there, we can go to the end.
		if (thisEntity.type == Type.END) {
			// let o = grid.getEndPlacement(current.i, current.j);
			// if (o.horizontal == di && o.vertical == dj) {
			if (thisEntity.rotation !== undefined) {
				if (thisEntity.rotation == 0) return "end-up";
				if (thisEntity.rotation == 4) return "end-down";
				if (thisEntity.rotation == 6) return "end-left";
				if (thisEntity.rotation == 2) return "end-right";
				return "end-"+ (thisEntity.rotation % 4 == 0 ? "vertical" : "horizontal");
			}
		}
		return "no";
	}

	selectTarget(di, dj, preferHorizontal, movement, secondaryMovement) {
		let grid = this.grid;
		let symmetry;
		// Select something
		let current = movement[movement.length - 1];
		let select = { ...current };
		// First, at start, can stay still within circle.
		let result = {}
		// Determine where we can go and how far.
		let diBack,
			djBack;
		if (movement.length > 1) {
			let previous = movement[movement.length - 2];
			diBack = previous.i - current.i;
			djBack = previous.j - current.j;
		}
		let secondary = null;
		if (secondaryMovement) {
			symmetry = grid.getSymmetry();
			secondary = {
				symmetry,
				movement: secondaryMovement,
				current: secondaryMovement[secondaryMovement.length - 1]
			};
		}
		let crossesPath = (di, dj) => {
			let blocker = movement.find(coord => {
				let targetIsCoord = coord.i == current.i + di && coord.j == current.j + dj;
				let isBacktrack = di == diBack && dj == djBack;
				return targetIsCoord ? !isBacktrack : false;
			});
			if (blocker != null) {
				return { blocker: blocker, midway: false };
			}
			if (secondary) {
				let sd = symmetry.reflectDelta({di: di, dj: dj});
				if (current.i + di == secondary.current.i + sd.di && current.j + dj == secondary.current.j + sd.dj) {
					return { vertex: true, midway: true };
				}
				if (current.i + di == secondary.current.i && current.j + dj == secondary.current.j) {
					return { vertex: false, midway: true };
				}
				blocker = secondary.movement.find(coord => coord.i == current.i + di && coord.j == current.j + dj);
				if (blocker != null) {
					return { blocker: blocker, midway: false };
				}
			}
			return null;
		}
		let calcProgress = (di, dj) => {
			if (di == 0 && dj == 0) return "no";
			
			// TODO: Clean this up, so length is calculated at the very
			// end and semantic meaning is preserved (e.g. for isEnd).
			let reach = this.pointIsReachable(current, di, dj);
			if (reach == "no") {
				return 0;
			} else if (reach.startsWith("end-")) {
				if (reach.endsWith("-up")) return dj == -1 ? UI.END_LENGTH : 0;
				if (reach.endsWith("-down")) return dj == 1 ? UI.END_LENGTH : 0;
				if (reach.endsWith("-left")) return di == -1 ? UI.END_LENGTH : 0;
				if (reach.endsWith("-right")) return di == 1 ? UI.END_LENGTH : 0;
				return UI.END_LENGTH;
			} else if (reach.startsWith("disjoint")) {
				return reach.endsWith("-w") ? UI.DISJOINT_W : UI.DISJOINT_H;
			}
			if (secondary) {
				let sd = symmetry.reflectDelta({ di, dj});
				reach = this.pointIsReachable(secondary.current, sd.di, sd.dj);
				if (reach == "no") {
					return 0;
				} else if (reach == "end") {
					return UI.END_LENGTH;
				} else if (reach.startsWith("disjoint")) {
					return reach.endsWith("-w") ? UI.DISJOINT_W : UI.DISJOINT_H;
				}
			}
			let cross = crossesPath(di, dj);
			if (cross) {
				let blocker = cross.blocker;
				let GU = preferHorizontal ? UI.CELL_WIDTH : UI.CELL_HEIGHT;
				if (blocker) {
					let point = grid.pointEntity(blocker.i, blocker.j);
					if (!point) {
						throw Error("bad element in path");
					}
					return point.type == Type.START ? GU - UI.START_R - (UI.GRID_LINE * .5) : GU - UI.GRID_LINE;
				} else if (cross.midway) {
					return cross.vertex ? GU - UI.GRID_LINE : (GU - UI.GRID_LINE) >> 1;
				}
			}
			return -1;
		}
		let horizontalProgress = calcProgress(di, 0);
		let verticalProgress = calcProgress(0, dj);
		// Optimization: Snap to line if closeby.
		// The most basic selection.
		if (horizontalProgress && verticalProgress) {
			if (preferHorizontal) select.i += di;
			else select.j += dj;
		} else if (horizontalProgress) {
			select.i += di;
		} else if (verticalProgress) {
			select.j += dj;
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
