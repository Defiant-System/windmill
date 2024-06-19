
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
				var tetrisErrors = Validation.validateTetris_(
						group.shape, tetrisVals, remainingErrors >= 0 ? remainingErrors : 0);
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
	}
};
