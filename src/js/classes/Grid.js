
class Grid {
	constructor(index) {
		// level info
		this.levelIndex = index;
		this.level = Level[index];

		// tmp object
		let storage = tmp_entities;
		// internals
		this.entities = storage.entity;
		this.symmetry = storage.symmetry || SymmetryType.NONE;

		var storeHeight = Math.floor(storage.entity.length / storage.width);
		this.width = Math.floor(storage.width / 2);
		this.height = Math.floor(storeHeight / 2);
		this.storeWidth = this.width * 2 + 1;
		this.storeHeight = this.height * 2 + 1;

		// sub objects
		this.navigationSelector = new NavigationSelector(this);
	}

	render(id) {
		// save value
		this.levelIndex = id;
		
		// default units
		let Defaults = [
				{ x: "grid", ui: "GRID_UNIT", val: 83 },
				{ x: "line", ui: "GRID_LINE", val: 19 },
				{ x: "gW", ui: "CELL_WIDTH", val: 83 },
				{ x: "gH", ui: "CELL_HEIGHT", val: 83 },
				{ x: "gap", ui: "DISJOINT_LENGTH", val: 22 },
			];

		// prepare xml, template & units
		let match = `//Data/Level[@id="${this.levelIndex}"]`;
		let xLevel = window.bluePrint.selectSingleNode(match);
		let xGrid = xLevel.selectSingleNode("./grid");

		// "gW" & "gH" is omitted but "grid" is set
		if (xGrid.getAttribute("grid") && !xGrid.getAttribute("gW")) xGrid.setAttribute("gW", xGrid.getAttribute("grid"));
		if (xGrid.getAttribute("grid") && !xGrid.getAttribute("gH")) xGrid.setAttribute("gH", xGrid.getAttribute("grid"));

		// sync level values with defaults / UI units
		Defaults.map(item => {
			if (xGrid.getAttribute(item.x)) {
				UI[item.ui] = +xGrid.getAttribute(item.x);
			} else {
				UI[item.ui] = item.val;
				xGrid.setAttribute(item.x, item.val);
			}
		});
		// use only "gW" & "gH"
		xGrid.removeAttribute("grid");

		// html output
		window.render({
			match,
			template: "level-puzzle",
			target: window.find(".game-view"),
		});
		
		// update window title
		window.title = `Witness - Level ${this.levelIndex}`;

		// center puzzle
		this.el = window.find(".game-view .level .puzzle");
		let top = (window.innerHeight - +this.el.prop("offsetHeight")) >> 1,
			left = (window.innerWidth - +this.el.prop("offsetWidth")) >> 1;
		this.el.css({ top, left });

		let base = window.bluePrint.selectSingleNode(`${match}/Palette/c[@key="base"]`);
		window.find("content").css({ "--base": base.getAttribute("val") });
	}

	initializeSnake(data) {
		data.grid = this.el;
		data.draw = this.el.find(".grid-path svg g");
		data.symmetry = this.getSymmetry();
		this.snake = new Snake(data);

		this.snake.setTargetingMouse(true);
	}

	updateSnake() {
		let msPerGridUnit = 75;
		this.snake.moveTowardsMouse(msPerGridUnit , this.navigationSelector);

		this.snake.render();
		// TODO: Infer touch interface a different way.
		if (this.snake.snapToGrid) {
			var start = document.getElementById("pathExtras");
			if (this.snake.atEnd()) {
				start.style.setProperty("display", "none");
			} else {
				start.style.setProperty("display", "block");
			}
		}
	}

	getSymmetry() {
		if (this.symmetry == SymmetryType.NONE) return null;
		else return new Symmetry(this.symmetry, this.width, this.height);
	}

	// Returns the automatic end orientation at a coord i, j.
	// This is symmetrical for all coordinates and symmetries.
	getEndPlacement(i, j) {
		for (var di = -1; di <= 1; di += 2) {
			var line = this.lineBetweenEntity(i, j, i + di, j);
			if (!line || line.type == Type.NONE) {
				return new Orientation(di, 0);
			}
		}
		for (var dj = -1; dj <= 1; dj += 2) {
			var line = this.lineBetweenEntity(i, j, i, j + dj);
			if (!line || line.type == Type.NONE) {
				return new Orientation(0, dj);
			}
		}
		return null;
	}

	info(i, j, type) {
		return `${type}[${i},${j}]`;
	}

	// jQuery-style entity getter/setter.
	entity(a, b, opt_val, opt_info) {
		var index = a + this.storeWidth * b;
		var inRange = a >= 0 && b >= 0 && a < this.storeWidth && b < this.storeHeight;
		if (opt_val && false) {
			// console.log([opt_info, a + "―", b + "|", index].join(","));
			console.log(`${opt_info},${a}-${b}|,${index}`);
		}
		if (opt_val) {
			if (!inRange) throw Error();
			this.entities[index] = opt_val;
		} else {
			if (!inRange) return null;
			return this.entities[index];
		}
	}

	lineBetweenEntity(i1, j1, i2, j2, opt_val) {
		if (Math.abs(i1 - i2) + Math.abs(j1 - j2) != 1) {
			throw Error(arguments);
		}
		return this.lineEntity(Math.min(i1, i2), Math.min(j1, j2), i1 == i2, opt_val);
	}

	lineEntity(i, j, isDown, opt_val) {
		var goDown = isDown ? 1 : 0;
		return this.entity(
				i*2 + (1 - goDown), j*2 + goDown, opt_val,
				this.info(i, j, goDown ? "|" : "―"));
	}

	pointEntity(i, j, opt_val) {
		return this.entity(i * 2, j * 2, opt_val, this.info(i, j, "•"));
	}
}
