
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

	render() {
		
	}
}
