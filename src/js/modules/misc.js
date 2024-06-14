
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
		DISJOINT_LENGTH: 30,
		EDIT_R: 20,
	};
