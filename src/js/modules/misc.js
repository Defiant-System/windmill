
let Type = {
		UNKNOWN: 0,
		// Multi-type
		NONE: 1,
		BASIC: 2,
		START: 3,
		END: 4,
		// Lines
		DISJOINT: 5,
		// Lines and point
		HEXAGON: 6,
		// Cell
		SQUARE: 7,
		STAR: 8,
		TETRIS: 9,
		ERROR: 10,
		TRIANGLE: 11,
	};

let SymmetryType = {
		UNKNOWN: 0,
		NONE: 1,
		HORIZONTAL: 2,
		VERTICAL: 3,
		ROTATIONAL: 4,
	};

// Non-wire enums.
let DrawType = {
		UNKNOWN: 0,
		CELL: 1,
		POINT: 2,
		HLINE: 3,
		VLINE: 4,
	};

let SegmentType = {
		UNKNOWN: 0,
		START: 1,
		MIDDLE: 2,
		END: 3,
	};

let Compass = {
		NORTH: 0,
		WEST: 1,
		SOUTH: 2,
		EAST: 3,
	};


// Keep everything in simple format.
let UI = {
		MARGIN: 50,
		GRID_UNIT: 83,
		GRID_LINE: 19,
		CELL_WIDTH: 83,
		CELL_HEIGHT: 83,
		END_LENGTH: 20,
		START_R: 26,
		TETRIS: 18,
		TETRIS_SPACE: 3,
		DISJOINT_LENGTH: 22,
		EDIT_R: 20,
	};


// simple utils
let Utils = {
	// get a random number within a range
	random(min, max) {
		return Math.random() * ( max - min ) + min | 0;
	},
	// calculate the distance between two points
	dist(x1, y1, x2, y2) {
		let dx = x1 - x2,
			dy = y1 - y2;
		return Math.sqrt((dx ** 2) + (dy ** 2));
	},
	getPosOnLine(x1, y1, x2, y2, perc) {
		return [ x1 * (1.0 - perc) + x2 * perc, y1 * (1.0 - perc) + y2 * perc ];
	},
	getDirection(x1, y1, x2, y2) {
		let pi = Math.PI,
			d = Math.atan2(y1 - y2, x1 - x2),
			compass = [pi * .5, pi, pi * -.5, 0];
		return compass.indexOf(d);
	},
	getAngle(x1, y1, x2, y2) {
		let theta = Math.atan2(y1 - y2, x1 - x2) * 180 / Math.PI;
		return theta < 0 ? theta = 360 + theta : theta;
	},
	getRadians(x1, y1, x2, y2) {
		return Math.atan2(y1 - y2, x1 - x2);
	},
	getXYFromRadAngle(radius, angle) {
		let x = radius * Math.cos(angle),
			y = radius * Math.sin(angle);
		return { x, y };
	},
	createCanvas(width, height) {
		let cvs = $(document.createElement("canvas")),
			ctx = cvs[0].getContext("2d", { willReadFrequently: true });
		cvs.prop({ width, height });
		return { cvs, ctx }
	}
};

