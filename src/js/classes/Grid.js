
class Grid {
	constructor(index) {
		// internals
		this._symmetry = false;
		// level info
		this.levelIndex = index;
		this.level = Level[index];

		// sub objects
		this.navigationSelector = new GridUi.NavigationSelector(grid);
	}

	get symmetry() {
		return this._symmetry;
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
		data.symmetry = this.symmetry;
		this.snake = new Snake(data);

		this.snake.setTargetingMouse(true);
	}

	updateSnake() {
		this.snake.moveTowardsMouse(75 /* msPerGridUnit */, this.navigationSelector);

		return;

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
}
