
let Validation = {
	getErrors(grid) {
		let snake = grid.snake,
			p;
		if (snake.secondaryMovement) {
			p = new Path(snake.movement.concat(snake.secondaryMovement), grid.width, grid.height, [snake.movement.length]);
		} else {
			p = new Path(snake.movement, grid.width, grid.height);
		}
		var originalErrors = [];
		// Per-entity checks
		grid.forEachEntity(function(value, i, j, drawType) {
			var type = value.type || Type.BASIC;
			var coord = {i: i, j: j};
			var hasError = false;
			if (type == Type.HEXAGON) {
				if (drawType == DrawType.POINT) {
					if (!(Keys.coordKey(coord) in p.coordsMap)) {
						hasError = true;
					}
				} else if (drawType == DrawType.HLINE || drawType == DrawType.VLINE) {
					if (!(Keys.lineKey({
								i: coord.i,
								j: coord.j,
								isDown: drawType == DrawType.VLINE
							}) in p.linesMap)) {
						hasError = true;
					}
				}
			} else if (type == Type.TRIANGLE) {
				var lineCount = 0;
				var addLine = function(di, dj, isDown) {
					if (Keys.lineKey({
								i: coord.i + di,
								j: coord.j + dj,
								isDown: isDown
							}) in p.linesMap) {
						lineCount++;
					}
				}
				addLine(0, 0, true);
				addLine(0, 0, false);
				addLine(1, 0, true);
				addLine(0, 1, false);
				var expected = value.triangle_count || 1;
				if (lineCount != expected) {
					hasError = true;
				}
			}
			if (hasError) {
				originalErrors.push({coord: coord, drawType: drawType});
			}
		});

		var allowedErrors = [];
		var specialErrors = [];
		var allErrors = [];
		var messages = [];
		var countCancelled = false;
		var groupings = p.makeGroupings();
		// Color DSL
		var all = undefined;

		var byType = function(type, opt_fn) {
			return function(val) {
				return val.cell.type == type && (opt_fn ? opt_fn(val.cell) : true);
			}
		}

		var getCount = function(vals) {
			return vals.length || null;
		}

		var filterColorsMap = function(colorsMap, opt_filter, opt_map) {
			let cm = Object.keys(colorsMap).map(k => {
				let vals = colorsMap[k];
				if (opt_filter) {
					vals = vals.filter(opt_filter);
				}
				if (opt_map) {
				 return opt_map(vals);
				}
				return vals;
			});

			return cm.filter(function(vals) {
				// Remove 0 and empty list.
				return opt_map ? vals !== undefined : vals.length != 0;
			});
		}

		groupings.forEach(function(group) {
			// var allVals = goog.array.map(goog.object.getValues(group.coords),
			var allVals = Object.values(group.coords).map(function(coord) {
				var cell = grid.cellKeyEntity(coord);
				return {coord: coord, cell: cell};
			});
			// Errors...
			var expectedErrors = allVals.filter(byType(Type.ERROR)).length;
			// console.log( expectedErrors );

			// var expectedErrors = goog.array.count(allVals, byType(Type.ERROR));
			var remainingErrors = expectedErrors;
			var errorsFeasible = expectedErrors > 0;

			var groupingErrors = [];
			var allowedGroupingErrors = [];
			function addCellErrors(vals, opt_allowed) {
				if (opt_allowed) {
					remainingErrors -= vals.length;
				}

				let addTo = opt_allowed ? allowedGroupingErrors : groupingErrors;
				vals.map(val => addTo.push({ coord: val.coord, drawType: DrawType.CELL }));

				// goog.array.extend(
				// 	opt_allowed ? allowedGroupingErrors : groupingErrors,
				// 	goog.array.map(vals, function(val) {
				// 		return {coord: val.coord, drawType: DrawType.CELL};
				// 	}));
			}

			var colorsMap = {};
			
			allVals.forEach(function(val) {
				var cell = grid.cellKeyEntity(val.coord);
				if (val.cell.type == Type.BASIC) {
					return;
				}
				var color = val.cell.color;
				// For now, don't allow arbitrary colors of all shapes, but force colored
				// ones to have that color.
				if (!color) {
					if (val.cell.type == Type.TETRIS && val.cell.shape) {
						color = val.cell.shape.negative ? Color.BLUE : Color.YELLOW;
					} else if (val.cell.type == Type.ERROR) {
						color = Color.WHITE;
					} else if (val.cell.type == Type.TRIANGLE) {
						color = Color.ORANGE;
					} else {
						return;
					}
				}
				if (!colorsMap[color]) {
					colorsMap[color] = [];
				}
				colorsMap[color].push(val);
			});
			var colorCounts = filterColorsMap(colorsMap, all, getCount);

			// First, check squares.
			var squareColorsMap = filterColorsMap(colorsMap, byType(Type.SQUARE));
			if (squareColorsMap.length > 1) {
				var squareColorCounts = [];
				var arr = filterColorsMap(squareColorsMap, all, getCount);
				arr.map((count, color) => {
					squareColorCounts.push([count, color]);
				});
				// Sort with key [count, color], so lowest count first
				squareColorCounts.sort();
				// In default case, show errors for everything, or less between two colors.
				var minColorCount = 0;
				if (squareColorCounts.length == 2) {
					minColorCount = squareColorCounts[0][0];
				}
				squareColorsMap.forEach(function(vals, color) {
					if (!minColorCount || vals.length == minColorCount) {
						addCellErrors(vals);
					}
				});
				if (remainingErrors >= 0) {
					// If we can use errors to resolve these conflicts, do it.
					// Requires sum(squareColorCounts[0:-2] <= remainingErrors
					squareColorsMap.forEach(function(vals, color) {
						if (color != squareColorCounts[squareColorCounts.length - 1][1]) {
							addCellErrors(vals, true /* opt_allowed */);
						}
					});
				}
			}
			// Then, stars.
			// TODO: How this interacts with errors is so broken.
			// Get the two ways to resolve errors (eliminating all stars,
			// eliminating all except two of color), use that to inform
			// tetris error count, and do *this* at the very end.
			var starColorsMap = filterColorsMap(colorsMap, byType(Type.STAR));
			if (Object.keys(starColorsMap).length > 0) {
				starColorsMap.forEach(function(vals, color) {
				// Object.keys(starColorsMap).map(k => {

					var colorTotal = colorCounts[color];
					if (colorTotal != 2) {
						// Default case.
						addCellErrors(vals);
						// If any allowed...
						if (remainingErrors >= 0) {
							// If we can just remove all the stars, that's easy.
							// This should happen in the lone star case as well.
							var minCount = vals.length;
							// If we can remove enough stars (but not all) to leave two left, do
							// that too. So xxo -> xo, xxxo -> xo, xxx -> xx.
							if (vals.length > 1) {
								minCount = Math.min(minCount, colorTotal - 2);
							}
							addCellErrors(vals.slice(0, minCount), true /* opt_allowed */);
						}
					}
				});
			}
			// Second-to-last: non-tetris errors. Excluding tetris, as that
			// affects how we search in some cases.
			// TODO: See note above about stars.
			var errorsInGroup = [];
			if (remainingErrors >= 0) {
				// Now, look through errors not specific to groupings.
				errorsInGroup = originalErrors.filter(function(error) {
					return p.groupingIncludes(group, error.coord, error.drawType);
				});
				remainingErrors -= errorsInGroup.length;
			}
			// If there are zero errors, it must be in tetris.
			// Tetris... the biggie.
			var tetrisVals = allVals.filter(byType(Type.TETRIS));
			if (tetrisVals.length > 0) {
				var tetrisErrors = Validation.validateTetris(group.shape, tetrisVals, remainingErrors >= 0 ? remainingErrors : 0);
				if (!tetrisErrors.success) {
					if (tetrisErrors.allowed) {
						// Length should be exactly equal to exactly remainingErrors.
						addCellErrors(tetrisErrors.allowed, true /* optAllowed */);
					} else {
						// We're not going to bother figure out how much under Tetris gets us.
						errorsFeasible = false;
					}
					addCellErrors(tetrisVals);
				}
				if (tetrisErrors.multipleErrors) {
					messages.push('Won\'t mix multiple Ys and polyominos ' +
							'(missing feature).');
				}
				if (tetrisErrors.timedOut) {
					messages.push('Timed out validating polyominos. Too clever!');
				}
				if (tetrisErrors.countCancelled) {
					countCancelled = true;
				}
			}
			errorsFeasible &= remainingErrors == 0;
			if (errorsFeasible) {
				if (errorsInGroup.length) {
					// goog.array.extend(allowedErrors, errorsInGroup);
					allowedErrors = allowedErrors.concat(errorsInGroup);
					errorsInGroup.forEach(function(err) {
						originalErrors.remove(err);
					});
				}
				// goog.array.extend(allowedErrors, allowedGroupingErrors);
				allowedErrors = allowedErrors.concat(allowedGroupingErrors);
				if (allowedGroupingErrors.length + errorsInGroup.length != expectedErrors) {
					throw new Error();
				}
			} else {
				addCellErrors(allVals.filter(byType(Type.ERROR)));
				// goog.array.extend(allErrors, groupingErrors);
				allErrors = allErrors.concat(groupingErrors);
			}
		});
		// goog.array.extend(allErrors, originalErrors);
		allErrors = allErrors.concat(originalErrors);
		// Slight annoyingness optimization: Only do this on success.
		if (countCancelled && !allErrors.length) {
			messages.push('Warning: cancelling blue and yellow polyominos based on ' +
					'count, not shape (missing feature).');
		}
		return {
			errors: allErrors,
			allowedErrors: allowedErrors,
			specialErrors: specialErrors,
			messages: messages
		};
	},

	validateTetris(gridShape, tetrisVals, expectedErrors) {
		var result = {success: false};
		if (tetrisVals.length == 0) {
			result.success = true;
			return result;
		}
		var trivialErrorCancellation = tetrisVals.length == expectedErrors;
		var tetrisState = new TetrisState(tetrisVals, gridShape);

		result.success = Validation.attemptTetris(tetrisState, tetrisState.getValidationAttempts(0)[0], result);
		if (expectedErrors == 0 || trivialErrorCancellation) {
			if (trivialErrorCancellation) {
				result.allowed = tetrisVals;
			}
			return result;
		} else {
			if (expectedErrors > 1) {
				// Requires quadratic+ filtering of stuff... eh.
				result.multipleErrors = true;
				return result;
			}
			if (!result.success) {
				var attempts = tetrisState.getValidationAttempts(1);
				goog.array.some(attempts, function(attempt) {
					if (Validation.attemptTetris(tetrisState, attempt, result)) {
						result.allowed = attempt.excluded;
						return true;
					}
					return false;
				});
			}
			return result;
		}
	},
	attemptTetris(tetrisState, attempt, result) {
		var search = Validation.attemptTetrisSearch(tetrisState, attempt, result);
		if (typeof search == "string" && tetrisState.logLevel) {
			tetrisState.printSearch(search);
		}
		return !!search;
	},
	attemptTetrisSearch(tetrisState, attempt, result) {
		if (attempt.positiveCount == attempt.negativeCount) {
			result.countCancelled = true;
			return true;
		} else if (attempt.positiveCount < attempt.negativeCount) {
			return false;
		} else if (
				!((attempt.positiveCount - attempt.negativeCount == tetrisState.gridCount) ||
					attempt.positiveCount == attempt.negativeCount)) {
			return false;
		}
		// How to handle (5x5 chunk, handful of negatives) case?
		// Allow placement of blocks which do not fit in bounds,
		// to a certain # of negative spaces
		var iters = 0;
		var queue = [tetrisState.getStartState(attempt)];
		while (queue.length) {
			// TODO: Use stateId for this, better indicator of CPU used.
			if ((++iters) % 50 == 0 && tetrisState.timedOut()) {
				result.timedOut = true;
				return false;
			}
			// It really does need to be BFS (an actual queue) for demonic cases.
			// TODO: This works very poorly when branching factor is very high,
			// for instance with dozens of unimos. Can we use more depth there?
			var node = queue.shift();
			// Success??
			// First: No more grid (only gets 0 width and height if empty).
			if (node.grid.width == 0 &&
					node.grid.height == 0 &&
					// Second: No more nodes to place.
					node.remaining.length == 0 &&
					// Third: No more negatives which need to be used.
					node.negative.length == 0 &&
					// Fourth: No negative outside-of-grid spaces that need to be
					// compensated for.
					!node.negativeGrid) {
				// It's a Christmas miracle!
				return node.key;
			}
			if (node.key in tetrisState.gridProgressTransitions) {
				continue;
			}
			var transitions = [];
			// There are two types of states: we have to remove cells from the grid by filling in
			// positives, or we already used up negative spaces to do the first thing and we need to
			// expand the grid by adding negatives.
			//
			// Pathological case:
			// Note that as soon as we use up any negatives, we immediately try to place them all, even if
			// there are still positives to go. So the worst case would be if we have to try all of the
			// permutations of negatives before trying the only place a single positive could be. (think
			// n negative vertical pieces of size 1 to n, and a n-by-n staircase half-block).
			//
			// TODO: This can be compensated for by first allowing removing tetris pieces with a negative
			// grid present, and second choosing the piece by safety score independent of negativity.
			// Also, prefer to use negatives without grid additions, greatly preferring to
			// avoid those branches.
			// Maximally prefer branches which will in the most grid nodes.
			// Way to represent removing tetrises with a negative grid: mark nodes
			// in the negative grid as having counts of just how negative they are.
			// Meanwhile, just put a cap on the number of iterations.
			// Why not play a nice game of fez instead??!
			// TODO: Implement better logging than commenting out lines of code.
			//console.log(`Node ==================== ndi${node.stateId}`); Shape.print(node.grid);
			if (node.negativeGrid && node.negative.length) {
				// Fill in the negatives.
				//console.log('Negative grid ===================='); Shape.print(node.negativeGrid);
				var unique = uniqueShapes(node.negative);
				goog.array.forEach(unique.uniqueShapes, function(tetris) {
					//console.log('Tetris --------' + (tetris.multiple ? 'm' : '.')); Shape.print(tetris);
					var newStates = Validation.addNegativeToGrid_(
							node.grid, node.negativeGrid, tetris, tetrisState.shapeOrientations);
					if (!newStates.length) {
						return;
					}
					var remainingNegative = unique.removeFn(tetris);
					// goog.array.forEach(newStates, function(newState) {
					newStates.filter(i => !!i).map(newState => {
						var newGrid = newState.grid;
						var newNegativeGrid = newState.negativeGrid;
						//console.log(`Result -------- ${remainingNegative.length} remaining, id${stateId}`); Shape.print(newGrid);
						//console.log(`Result negative --------`); Shape.print(newNegativeGrid);

						var state = {grid: newGrid, remaining: node.remaining, negative: remainingNegative};
						if (newNegativeGrid) {
							state.negativeGrid = newNegativeGrid;
						}
						var key = tetrisState.registerGridProgressKey(state);
						// Actually, we do even need to calculate the key?
						// See note below on gridProgressTransitions mutation.
						//console.log(`${node.key} -> ${state.key}`);
						transitions.push(key);
						queue.push(state);
					});
				});
			} else if (node.remaining) {
				// We're in positive land.
				// Get the biggest negative dimensions, which determines
				// how crazy we are about placing out of bounds.
				var maxNeg = Shape.getDimensions(node.negative);
				var unique = uniqueShapes(node.remaining);
				// goog.array.forEach(unique.uniqueShapes, function(tetris) {

				unique.uniqueShapes.map(tetris => {
					//console.log('Tetris --------' + (tetris.multiple ? 'm' : '.')); Shape.print(tetris);
					var newStates = Validation.removeTetrisFromGrid(node.grid, tetris, tetrisState.shapeOrientations, maxNeg);
					if (!newStates.length) {
						return;
					}
					var remaining = unique.removeFn(tetris);
					newStates.filter(i => !!i).map(newState => {
						var newGrid = newState.grid;
						//console.log(`Result -------- ${remaining.length} remaining, id${stateId}`); Shape.print(newGrid);
						var state = { grid: newGrid, remaining: remaining, negative: node.negative };
						if (newState.negativeGrid) {
							state.negativeGrid = newState.negativeGrid;
						}
						state.index = newState.index;
						var key = tetrisState.registerGridProgressKey(state);
						transitions.push(key);
						queue.push(state);
					});
				});
			}
			// TODO: The value in this map isn't really used for anything.
			// A boolean would probably be fine.
			tetrisState.registerGridProgressTransition(node.key, transitions);
		}
		return false;
	},
	removeTetrisFromGrid(grid, originalTetris, shapeOrientations, negInfo) {
		// TODO: Allow doing this with a negativeGrid (requires being able to double-count
		// nodes for filling in negatives).
		var negativesRemaining = !!negInfo;
		var tetrises = originalTetris.free && shapeOrientations
				? shapeOrientations[keys.shapeKey(originalTetris)]
				: [originalTetris];
		
		var coords = [];
		tetrises.map(tetris => {
			// goog.array.extend(coords, Shape.getGridFits(grid, tetris, negInfo));
			coords = coords.concat(Shape.getGridFits(grid, tetris, negInfo));
		});

		let filtered = coords.map((coord, index) => {
		// return goog.array.filter(goog.array.map(coords, function(coord, index) {
			// Actually fill in the grid with the shape.
			// If we need negatives to do this, fill in the real grid with the caveat
			// that the negative space must be first filled in to continue.
			var i = coord.i,
				j = coord.j,
				tetris = coord.shape;
			var newGrid = grid;
			var negativeGrid = null;
			if (coord.negativeShape) {
				var negativeGridOffset = {i: i, j: j};
				// Expand the real grid and negative grid as necessary.
				// For the real grid, push it down and right if the tetris match is off in left field,
				// like negative i or j.
				var gridLeft = Math.abs(Math.min(0, i));
				var gridTop = Math.abs(Math.min(0, j));
				// Now the same for tetris, push it down and right if it's in the middle
				// of the grid.
				// Aka translate the tetris coordinate system to the new grid coordinate system.
				var tetrisLeft = Math.max(0, i);
				var tetrisTop = Math.max(0, j);
				// Left offset, right offset, total width, total height.
				newGrid = Shape.expand(newGrid,
						gridLeft,
						gridTop,
						Math.max(gridLeft + newGrid.width, tetrisLeft + tetris.width),
						Math.max(gridTop + newGrid.height, tetrisTop + tetris.height),
						[coord, negativeGridOffset]);
				// Add negative grid, which is currently in the tetris coord system.
				negativeGrid = coord.negativeShape;
				//console.log('********** Prenegative'); Shape.print(negativeGrid);
				negativeGrid.offset = negativeGridOffset;
				negativeGrid = Shape.reduce(negativeGrid);
				//console.log('********** Negative'); Shape.print(negativeGrid);
			}
			// Clone the shape if necessary.
			if (grid == newGrid) {
				newGrid = {
					grid: [...grid.grid],
					width: grid.width,
					height: grid.height
				};
			}
			Shape.setOnGrid(newGrid, coord, false);

			// Do some simplifications if we're subtracting normally.
			newGrid = Shape.reduce(newGrid, negativeGrid ? [negativeGrid.offset] : undefined);
			// Don't unnecessarily split up connected components to limit search space.
			// Except if the grid or tetris is split up, or there are negatives in our future.
			Shape.setMultiple(newGrid);
			if (!(tetris.multiple || grid.multiple || negativesRemaining) && newGrid.multiple) {
				return null;
			}

			var answer = {grid: newGrid};
			if (negativeGrid) {
				answer.negativeGrid = negativeGrid;
			}
			answer.index = index;
			return answer;
		});
		// }), goog.functions.identity);

		return filtered;
	}
};
