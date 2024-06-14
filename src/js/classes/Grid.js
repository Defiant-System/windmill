
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
		
		// html output
		let match = `//Data/Level[@id="${this.levelIndex}"]`;
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
		data.draw = this.el.find(".grid-path svg");
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
