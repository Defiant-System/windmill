
class Grid {
	constructor(index) {
		// level info
		this.levelIndex = index;

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
		// adapt start radius to line width
		UI.START_R = (UI.GRID_LINE * 2.5) / 2;
		// double disjoint gap
		UI.DISJOINT_H = (UI.CELL_HEIGHT - UI.GRID_LINE - UI.DISJOINT_LENGTH) / 2;
		UI.DISJOINT_W = (UI.CELL_WIDTH - UI.GRID_LINE - UI.DISJOINT_LENGTH) / 2;

		// make sure particles are reset
		Particles.reset();

		// generate storage entities, etc
		this.generateStorage(xLevel);

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

		let base = window.bluePrint.selectSingleNode(`//Palette[@id="${xLevel.getAttribute("palette")}"]/c[@key="base"]`),
			show = id === "lobby" ? "start-view" : "game-view";
		window.find("content").data({ show }).css({ "--base": base.getAttribute("val") });
	}

	initializeSnake(data) {
		data.grid = this;
		data.gridEl = this.el;
		data.draw = this.el.find(".grid-path svg g");
		data.symmetry = this.getSymmetry();
		this.snake = new Snake(data);

		this.snake.setTargetingMouse(true);
		this.snake.render();

		// sound fx
		window.audio.play("start");

		// UI update
		this.el.addClass("snake-active");

		// enables a nice "grow" effect at start
		this._started = false;
		data.draw.find("circle").cssSequence("started", "animationend", el => this._started = true);
	}

	updateSnake() {
		if (!this._started) return;
		let msPerGridUnit = 75;
		this.snake.moveTowardsMouse(msPerGridUnit , this.navigationSelector);
		this.snake.render();
	}

	finishSnake() {
		let fadeOutSnake = (sequence="fade-out") => {
				// UI update
				this.el.removeClass("snake-active");
				// fade out snake and empty its contents
				this.el.find(".grid-path").cssSequence(`${sequence}-snake`, "transitionend", el => {
					// reset grid path
					el.removeClass("fade-out-snake glow-snake");
					// empty snake body
					el.find("svg > g").html("");
				});
			};
		// reset started flag
		delete this._started;

		// to UI debug snake
		// return;

		// path not completed - reset
		if (!this.snake.atEnd()) {
			return fadeOutSnake();
		}

		// Success or failure at end
		let err = Validation.getErrors(this);
		// show errors
		if (err.errors.length) {
			let errors = err.errors.concat(err.allowedErrors);
			console.log(errors);
			// sound fx
			window.audio.play("fail");
			// reset level
			fadeOutSnake();
			return;
		}
		// start fire flies
		Particles.start(this);
		// reset level
		fadeOutSnake("glow");
		// sound fx
		window.audio.play("solved");
	}

	forEachEntity(fn, scope) {
		for (var a=0; a<this.storeWidth; a++) {
			for (var b=0; b<this.storeHeight; b++) {
				var value = this.entities[a + this.storeWidth * b];
				var drawType = this.getDrawType(a, b);
				fn.call(scope, value, Math.floor(a / 2), Math.floor(b / 2), drawType);
			}
		}
	}

	setSymmetry(symmetry) {
		this.symmetry = symmetry;
		this.sanitize();
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

	getDrawType(a, b) {
		if (a % 2 == 0 && b % 2 == 0) return DrawType.POINT;
		else if (a % 2 == 1 && b % 2 == 1) return DrawType.CELL;
		else if (a % 2 == 0) return DrawType.VLINE;
		else if (b % 2 == 0) return DrawType.HLINE;
		else throw Error();
	}

	info(i, j, type) {
		return `${type}[${i},${j}]`;
	}

	getEntity(a, b) {
		var index = (this.storeWidth * (b * 2)) + (a * 2);
		return this.entities[index];
	}

	// jQuery-style entity getter/setter.
	entity(a, b, val, info) {
		var index = a + this.storeWidth * b;
		var inRange = a >= 0 && b >= 0 && a < this.storeWidth && b < this.storeHeight;
		if (val && false) {
			// console.log([info, a + "―", b + "|", index].join(","));
			console.log(`${info},${a}-${b}|,${index}`);
		}
		if (val) {
			if (!inRange) throw Error();
			this.entities[index] = val;
		} else {
			if (!inRange) return null;
			return this.entities[index];
		}
	}

	// Should add one for entity by drawtype.
	cellKeyEntity(key, opt_val) {
		return this.cellEntity(key.i, key.j, opt_val);
	}

	pointKeyEntity(key, opt_val) {
		return this.pointEntity(key.i, key.j, opt_val);
	}

	cellEntity(i, j, opt_val) {
		return this.entity(i * 2 + 1, j * 2 + 1, opt_val, this.info(i, j, "□"));
	}

	lineBetweenEntity(i1, j1, i2, j2, val) {
		if (Math.abs(i1 - i2) + Math.abs(j1 - j2) != 1) throw Error(arguments);
		return this.lineEntity(Math.min(i1, i2), Math.min(j1, j2), i1 == i2, val);
	}

	lineEntity(i, j, isDown, val) {
		var goDown = isDown ? 1 : 0,
			a = i * 2 + (1 - goDown),
			b = j * 2 + goDown,
			info = this.info(i, j, goDown ? "|" : "―");
		return this.entity(a, b , val, info);
	}

	pointEntity(i, j, val) {
		return this.entity(i * 2, j * 2, val, this.info(i, j, "•"));
	}

	generateStorage(xLevel) {
		// get grid base
		let xGrid = xLevel.selectSingleNode(`./grid`),
			xpath = ["ns", "nsd", "nse", "we", "wed", "wee"].map(t => `@type="${t}"`),
			xPoints = xGrid.selectNodes(`./i[${xpath.join(" or ")}]`);
		// console.log( xGrid );

		let storage = {
				entity: [],
				symmetry: +xGrid.getAttribute("symmetry") || SymmetryType.NONE,
				width: (+xGrid.getAttribute("width") * 2) + 1,
				height: (+xGrid.getAttribute("height") * 2) + 1,
			};

		[...Array(storage.height)].map(row => {
			[...Array(storage.width)].map(col => {
				storage.entity.push({ type: null });
			});
		});

		xGrid.selectNodes(`./i`).map(xNode => {
			let type = xNode.getAttribute("type"),
				x = +xNode.getAttribute("x"),
				y = +xNode.getAttribute("y"),
				index = (storage.width * (y * 2)) + (x * 2);
			switch (type) {
				case "start":
					storage.entity[index].type = Type.START;
					break;
				case "exit":
					storage.entity[index].type = Type.END;
					storage.entity[index].rotation = +xNode.getAttribute("d");
					break;
				case "nsd":
					storage.entity[index + storage.width].type = Type.DISJOINT;
					break;
				case "wed":
					storage.entity[index + 1].type = Type.DISJOINT;
					break;
				case "nse":
					storage.entity[index + storage.width].type = Type.NONE;
					break;
				case "wee":
					storage.entity[index + 1].type = Type.NONE;
					break;
				case "dot":
					storage.entity[index + storage.width + 1].type = Type.SQUARE;
					storage.entity[index + storage.width + 1].color = +xNode.getAttribute("c");
					break;
			}
		});

		// console.log( storage.entity );
		// storage.entity.map((e, i) => console.log( i, JSON.stringify(e) + (i % 9 == 8 ? "---" : "") ));

		// tmp object
		// storage = tmp_entities;
		// internals
		this.entities = storage.entity;
		this.symmetry = storage.symmetry || SymmetryType.NONE;

		var storeHeight = Math.floor(storage.entity.length / storage.width);
		this.width = Math.floor(storage.width / 2);
		this.height = Math.floor(storeHeight / 2);
		this.storeWidth = this.width * 2 + 1;
		this.storeHeight = this.height * 2 + 1;
	}
}
