
class Snake {

	static id_ = 0;
	static MAX_PROGRESS_ = UI.GRID_UNIT;

	constructor(opt) {
		// The current path.
		this.snakeId = ++Snake.id_;
		this.start = { i: opt.x, j: opt.y };
		this.mouse = { x: opt.mX, y: opt.mY };
		this.movement = [this.start];

		// Symmetry snakes (render-only)
		if (opt.symmetry) {
			this.symmetry = true;
			this.secondarySnakeId = ++Snake.id_;
			this.secondaryMovement = [this.symmetry.reflectPoint(this.start)];
		} else {
			this.symmetry = null;
			this.secondarySnakeId = null;
			this.secondaryMovement = null;
		}

		// fast references
		this.gridEl = opt.grid;

		// SVG elements
		this.snakeEl = null;
		this.secondarySnakeEl = null;

		// Progress through path
		this.target = null;
		this.targetMaxProgress = null;
		this.targetIsEnd = null;

		// An ongoing path addition or subtraction.
		// Progress is from 0 to MAX_PROGRESS, target == null <=> progress == 0.
		// target cannot be MAX_PROGRESS as steady state (only when about to retract).
		this.progress = 0;

		// The board!
		this.draw = opt.draw;

		// Misc state for execution/optimization.
		this.lastUpdateTime = null;
		this.mouseX = opt.mX ? opt.mX : 0;
		this.mouseY = opt.mY ? opt.mY : 0;
		this.frameTime = new ElapsedTime();
		this.mouseHistoryX = [];
		this.mouseHistoryY = [];
		this.targetingMouse = false;
		this.snapToGrid = false;
	}

	setTargetingMouse(targetingMouse, snapToGrid) {
		this.targetingMouse = targetingMouse;
		this.snapToGrid = snapToGrid;
	}

	atEnd() {
		return this.targetIsEnd && this.progress === this.targetMaxProgress;
	}

	markSuccessful() {
		if (this.snakeEl) this.snakeEl.addClass("glow");
		if (this.secondarySnakeEl) this.secondarySnakeEl.addClass("glow");
	}

	setMouseDiff(mouseX, mouseY) {
		this.mouseX += mouseX;
		this.mouseY += mouseY;
	}

	calcMouseOnGrid() {
		let gridOnPage = this.grid.offset(),
			mouseOnGrid = {
				x: this.mouseX - gridOnPage.left - UI.MARGIN,
				y: this.mouseY - gridOnPage.top - UI.MARGIN
			};
		return mouseOnGrid;
	}

	moveTowardsMouse(msPerGridUnit, selector) {
		let maxMovement;
		if (this.targetingMouse) {
			let elapsedMs = this.frameTime.step();
			if (elapsedMs == null) return;
			
			maxMovement = Math.floor(elapsedMs / msPerGridUnit * Snake.MAX_PROGRESS_ / 1.5);
			// Simplifying assumption: Max one unit per animation frame, so
			// moveTowardsTarget only needs to be called twice below.
			maxMovement = Math.min(maxMovement, Snake.MAX_PROGRESS_);
		} else {
			this.mouseHistoryX.push(this.mouseX);
			this.mouseHistoryY.push(this.mouseY);
			if (this.mouseHistoryX.length > 3) {
				this.mouseHistoryX.shift();
				this.mouseHistoryY.shift();
			}

			// should ideally separate max distance into vertical and horizontal.
			let mdx = (this.mouseHistoryX[this.mouseHistoryX.length - 1] - this.mouseHistoryX[0]) / this.mouseHistoryX.length * 2.5;
			let mdy = (this.mouseHistoryY[this.mouseHistoryY.length - 1] - this.mouseHistoryY[0]) / this.mouseHistoryY.length * 2.5;
			let move = Math.max(Math.abs(mdx), Math.abs(mdy));
			maxMovement = move;  // Keep it easy...
		}
		let remaining = this.moveTowardsTarget(maxMovement, selector);
		if (remaining != undefined) this.moveTowardsTarget(remaining, selector);
	}

	moveTowardsTarget(maxMovement, selector) {
		let dx = null,
			dy = null,
			params,
			actualMovement;
		
		if (this.targetingMouse) {
			let mouseOnGrid = this.calcMouseOnGrid();
			let pointOnGrid = this.getHead();
			if (!this.snapToGrid) {
				let distanceX = mouseOnGrid.x - Math.round(mouseOnGrid.x / UI.GRID_UNIT) * UI.GRID_UNIT;
				let distanceY = mouseOnGrid.y - Math.round(mouseOnGrid.y / UI.GRID_UNIT) * UI.GRID_UNIT;
				let threshhold = UI.GRID_LINE * 2;
				if (Math.abs(distanceX) <= threshhold && dy >= UI.GRID_UNIT) {
					mouseOnGrid.x -= distanceX;
				}
				if (Math.abs(distanceY) <= threshhold && dx >= UI.GRID_UNIT) {
					mouseOnGrid.y -= distanceY;
				}
			}
			dx = mouseOnGrid.x - pointOnGrid.x;
			dy = mouseOnGrid.y - pointOnGrid.y;
			params = {
				di: Math.sign(dx),
				dj: Math.sign(dy),
				preferHorizontal: Math.abs(dx) >= Math.abs(dy)
			};
		} else {
			let mdx = (this.mouseHistoryX[this.mouseHistoryX.length - 1] - this.mouseHistoryX[0]) / this.mouseHistoryX.length * 2.5;
			let mdy = (this.mouseHistoryY[this.mouseHistoryY.length - 1] - this.mouseHistoryY[0]) / this.mouseHistoryY.length * 2.5;
			if (Math.abs(mdx) * 5 < Math.abs(mdy)) mdx = 0;
			if (Math.abs(mdy) * 5 < Math.abs(mdx)) mdy = 0;

			params = {
				di: Math.sign(mdx),
				dj: Math.sign(mdy),
				preferHorizontal: Math.abs(mdx) >= Math.abs(mdy)
			};
		}
		let di = params.di;
		let dj = params.dj;
		if (this.target == null && !this.discoverTarget(selector, params)) return;
		
		let remainingProgress = 0;
		// Want to move towards mouse along axis of concern. Don't initially want to move farther
		// than mouse, and want to figure out next target before moving there.
		// In case where we end up at target, remove target for next time.
		let current = this.movement[this.movement.length - 1];
		let isVertical = current.i == this.target.i;
		if (isVertical ? dj == 0 : di == 0) {
			if ((isVertical ? di == 0 : dj == 0) || this.targetIsEnd) return;
			
			// If not targetingMouse, the user may move in a direction we can't go.
			// In that case, we still might be able to move orthogonally, away from
			// the center of the grid line.
			// (Also, don't do this in an end cap, because any slight movement might
			// cause the entire line to get dismissed.)
			if (isVertical) {
				dj = (this.target.j > current.j) == (this.progress >= 50) ? 1 : -1;
				di = 0;
			} else {
				di = (this.target.i > current.i) == (this.progress >= 50) ? 1 : -1;
				dj = 0;
			}
		}

		// We have to do this twice because, if targetingMouse and the user moves
		// in a direction we can't go, we might still be able to realign our movement
		// from vertical to non-vertical, or vice versa, and move orthogonally.
		for (let i = 0; i < 2; i++) {
			let makingProgress = isVertical
					? ((dj > 0) == (this.target.j > current.j))
					: ((di > 0) == (this.target.i > current.i));
			let progressBeforeChangeRequired = Math.max(0, makingProgress
					? (this.progress + maxMovement) - Snake.MAX_PROGRESS_
					: 0 - (this.progress - maxMovement));
			if (progressBeforeChangeRequired > 0) {
				maxMovement -= progressBeforeChangeRequired;
				remainingProgress += progressBeforeChangeRequired;
			}
			// First, cap by axis. Do this for the absolute value of movement, because
			// the values already agree on direction (we always move in the direction of
			// decreasing delta).
			actualMovement = maxMovement;
			if (dx != null && dy != null) {
				let maxAxisMovement = Math.abs(Math.floor((isVertical ? dy : dx) * Snake.MAX_PROGRESS_ / UI.GRID_UNIT));
				if (maxAxisMovement == 0 && !this.targetIsEnd) {
					// Otherwise, can move orthogonal.
					if (isVertical) {
						dj = (this.target.j > current.j) == (this.progress >= 50) ? 1 : -1;
						di = 0;
					} else {
						di = (this.target.i > current.i) == (this.progress >= 50) ? 1 : -1;
						dj = 0;
					}
					if (dx != null && dy != null) {
						let tmp = dx;
						dx = dy;
						dy = tmp;
					}
					isVertical = !isVertical;
					// Let's try again with new isVertical.
					continue;
				}
				actualMovement = Math.min(actualMovement, maxAxisMovement);
			}
			// Now artifical caps, only if making progress.
			if (makingProgress && this.targetMaxProgress != null) {
				actualMovement = Math.min(
						actualMovement,
						this.targetMaxProgress - this.progress);
			}
			this.progress += makingProgress ? actualMovement : -actualMovement;
			break;
		}
		// If we were stopped for any reason, we wouldn't be able to reach
		// a target decision.
		if (actualMovement < maxMovement) return;
		
		if (this.progress <= 0) {
			// Backtracked, so forget where we came from.
			this.clearTarget();
			this.progress = Snake.MAX_PROGRESS_;
			// console.log("Backtrack, target null!");
			if (remainingProgress == 0 || !this.discoverTarget(selector, params)) {
				return;
			}
		} else if (this.progress >= Snake.MAX_PROGRESS_) {
			// Move forward, so store it.
			if (this.target.i == current.i && this.target.j == current.j) {
				throw Error();
			}
			this.movement.push(this.target);
			if (this.symmetry) {
				this.secondaryMovement.push(this.symmetry.reflectPoint(this.target));
			}
			this.clearTarget();
			this.progress = 0;
			// console.log("Forwards, target null!");
			if (remainingProgress == 0 || !this.discoverTarget(selector, params)) return;
		}
		return remainingProgress;
	}

	clearTarget() {
		this.target = null;
		this.targetMaxProgress = null;
		this.targetIsEnd = false;
	}

	discoverTarget(selector, params) {
		if (this.target != null) return true;

		let current = this.movement[this.movement.length - 1];
		let previous = this.movement.length > 1 ? this.movement[this.movement.length - 2] : null;
		let response = selector.selectTarget(params.di, params.dj, params.preferHorizontal, this.movement, this.secondaryMovement);
		let select = response.select;
		// Allow the case where select is absent or equal to previous value.
		if (!select || (select.i == current.i && select.j == current.j)) return false;
		
		// Otherwise, can only move in one direction at a time.
		if (Math.abs(select.i - current.i) + Math.abs(select.j - current.j) != 1) {
			throw Error("bad prev");
		}
		// And only in the direction of the mouse.
		if ((params.di != 0 && Math.sign(select.i - current.i) == -Math.sign(params.di)) ||
			(params.dj != 0 && Math.sign(select.j - current.j) == -Math.sign(params.dj))) {
			throw Error("too complicated");
		}
		if (previous && (select.i == previous.i && select.j == previous.j)) {
			this.movement.pop();
			if (this.symmetry) this.secondaryMovement.pop();
			
			this.target = current;
			this.targetMaxProgress = null;
			this.progress = Snake.MAX_PROGRESS_;
		} else {
			if (select.i == current.i && select.j == current.j) throw Error();
			
			this.target = select;
			this.targetMaxProgress = response.maxProgress !== undefined ? response.maxProgress : null;
			this.targetIsEnd = !!response.isEnd;
			this.progress = 0;

		}
		return true;
	}

	getHead() {
		let lastTarget = this.movement[this.movement.length - 1];
		let x = lastTarget.i * UI.GRID_UNIT;
		let y = lastTarget.j * UI.GRID_UNIT;
		if (this.target) {
			x += (this.progress * UI.GRID_UNIT / Snake.MAX_PROGRESS_) * (this.target.i - lastTarget.i);
			y += (this.progress * UI.GRID_UNIT / Snake.MAX_PROGRESS_) * (this.target.j - lastTarget.j);
		}
		return { x, y };
	}

	getRenderContents(movement, target) {
		// Initial output: start, direction. If last one, also include progress.
		// In the future, add arcs.
		let contents = [];
		let previous = null;
		for (let i = 0; i <= movement.length; i++) {
			let isEnd = i == movement.length;
			if (isEnd && !target) continue;
			
			let coords = isEnd ? target : movement[i];
			let segment = { i: coords.i, j: coords.j };
			if (!previous) {
				segment.segmentType = SegmentType.START;
			} else {
				segment.segmentType = isEnd ? SegmentType.END : SegmentType.MIDDLE;
				segment.direction = coords.i == previous.i ? DrawType.VLINE : DrawType.HLINE;
				if (isEnd && this.progress > 0) {
					let movingDownOrRight = coords.i > previous.i || coords.j > previous.j;
					// The offset to start/end of line.
					segment.start = movingDownOrRight ? 0 : Snake.MAX_PROGRESS_ - this.progress;
					segment.end = movingDownOrRight ? Snake.MAX_PROGRESS_ - this.progress : 0;
				}
				segment.i = Math.min(coords.i, previous.i);
				segment.j = Math.min(coords.j, previous.j);
			}
			contents.push(segment);
			previous = coords;
		}
		return contents;
	}

	anythingChanged() {
		// hash code avoid constantly rendering.
		let current = this.movement[this.movement.length - 1],
			change = (current.i * 16 * 16 + current.j * 16 + this.movement.length) * Snake.MAX_PROGRESS + this.progress;
		if (this.lastChange == null || this.lastChange != change) {
			this.lastChange = change;
			return true;
		} else {
			return false;
		}
	}

	render() {
		if (!this.anythingChanged()) return;

		let contents = this.getRenderContents(this.movement, this.target);
		this.snakeEl = this.renderSingle(contents, this.snakeId, this.snakeEl);

		if (this.symmetry) {
			let symTarget = this.target ? this.symmetry.reflectPoint(this.target) : null;
			contents = this.getRenderContents(this.secondaryMovement, symTarget);
			this.secondarySnakeEl = this.renderSingle(contents, this.secondarySnakeId, this.secondarySnakeEl);
		}
	}

	renderSingle(contents, snakeId, snakeEl) {
		// Ugly DOM manipulation to insert SVG dynamically.
		if (!snakeEl) {
			snakeEl = document.createElementNS("http://www.w3.org/2000/svg", "g")
			snakeEl.setAttribute("class", `path${snakeId}`);
			this.draw.append(snakeEl);
		}
		// console.log(contents);
		this.renderSvg(snakeEl, contents);

		return snakeEl;
	}

	renderSvg(el, contents) {
		let out = contents.map(segment => {
			let isLastSegment,
				x = segment.i * UI.GRID_UNIT,
				y = segment.j * UI.GRID_UNIT,
				direction = segment.direction,
				start = segment.start || 0,
				end = segment.end || 0,
				horizontal = direction == DrawType.HLINE ? 1 : 0,
				vertical = 1 - horizontal,
				soff = start ? start : 0,
				eoff = end ? end : 0,
				partial = start || end ? 1 : 0,
				x1 = x + horizontal * partial * soff,
				y1 = y + vertical * partial * soff,
				x2 = x + horizontal * (UI.GRID_UNIT - partial * eoff),
				y2 = y + vertical * (UI.GRID_UNIT - partial * eoff),
				str = "";

			// console.log( segment );
			switch (segment.segmentType) {
				case SegmentType.UNKNOWN:
					break;
				case SegmentType.START:
					str = `<circle cx="${x1}" cy="${y1}" r="${UI.START_R}" />`;
					break;
				case SegmentType.MIDDLE:
					str = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="${UI.GRID_LINE+1}" stroke-linecap="round"></line>`;
					break;
				case SegmentType.END:
					str = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="${UI.GRID_LINE+1}" stroke-linecap="round"></line>`;
					break;
			}
			return str;
		});
		let str = `<g>${out.join("")}</g>`;
		$(el).html(str);
	}

	// stringRepr() {}
	// fadeSingle(snakeEl, opt_timeout, opt_callback) {}
	// fade(opt_timeout, opt_callback) {}

}
