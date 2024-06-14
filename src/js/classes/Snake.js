
class Snake {

	static id_ = 0;
	static MAX_PROGRESS_ = UI.GRID_UNIT;

	constructor(opt) {
		// The current path.
		this._id = ++Snake.id_;
		this.start = { x: opt.x, y: opt.y };
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
			
			maxMovement = Math.floor(elapsedMs / msPerGridUnit * MAX_PROGRESS / 1.5);
			// Simplifying assumption: Max one unit per animation frame, so
			// moveTowardsTarget only needs to be called twice below.
			maxMovement = Math.min(maxMovement, MAX_PROGRESS);
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

	}

	clearTarget() {

	}

	discoverTarget(selector, params) {

	}

	getHead() {

	}

	getRenderContents(movement, target) {

	}

	renderSingle(contents, snakeId, snakeEl) {

	}

	render() {

	}

	anythingChanged() {

	}

	stringRepr() {

	}

	fadeSingle(snakeEl, opt_timeout, opt_callback) {

	}

	fade(opt_timeout, opt_callback) {

	}

}
