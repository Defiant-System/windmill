
let Snake = {
	init() {
		this.APP = witney;
		this.content = witney.content;
		this.doc = $(document);
		// 0 : up
		// 1 : right
		// 2 : down
		// 3 : left
		this.direction = false;

		// temp
		this.content.find(".puzzle").addClass("debug");
		this.content.on("mousedown", ".puzzle", this.move);
	},
	startPuzzle(event) {
		let puzzle = event.el.parents(".puzzle").addClass("started"),
			unit = parseInt(puzzle.cssProp("--unit"), 10);
		// fast references
		this.puzzle = {
			el: puzzle,
			offset: {
				width: +puzzle.prop("offsetWidth"),
				height: +puzzle.prop("offsetHeight"),
			},
			grid: {
				unit,
				u2: unit / 2,
				width: +puzzle.cssProp("--width"),
				height: +puzzle.cssProp("--height"),
				cols: (+puzzle.cssProp("--width") * 2) + 1,
				rows: (+puzzle.cssProp("--height") * 2) + 1,
			},
		};
		// reference to active el
		this.onEl = event.el;
	},
	start(event) {
		let sX = +event.el.prop("offsetLeft") + 7,
			sY = +event.el.prop("offsetTop") + 7,
			snake = [];

		// prepare puzzle
		this.startPuzzle(event);

		// snake nest
		snake.push(`<circle class="nest" cx="${sX}" cy="${sY}" r="${this.puzzle.grid.unit + 5}"/>`);
		snake.push(`<line class="neck" x1="${sX}" y1="${sY}" x2="${sX}" y2="${sY}"/>`);
		snake.push(`<circle class="head" cx="${sX}" cy="${sY}" r="${this.puzzle.grid.unit * .5}"/>`);

		// add snake to DOM
		let o = this.puzzle.offset,
			el = this.puzzle.el.append(`<svg class="snake" viewBox="0 0 ${o.width} ${o.height}">${snake.join("")}</svg>`),
			head = el.find(".head"),
			neck = el.find(".neck"),
			nest = el.find(".nest");
		this.els = { el, nest, head, neck };

		this.pos = {
			origoX: event.clientX,
			origoY: event.clientY,
		};
		// get constraints
		// this.getLimits();

		// cover app content
		this.content.addClass("cover");
		// bind event handler
		this.doc.bind("click mousemove", this.move);
	},
	move(event) {
		let Self = Snake,
			APP = Self.APP;
		switch (event.type) {
			case "click":
				// dispose snake & reset puzzle
				Self.puzzle.el.find("svg.snake").remove();
				Self.puzzle.el.removeClass("started");
				// reset app content
				Self.content.removeClass("cover");
				// bind event handler
				Self.doc.unbind("click mousemove", Self.move);
				break;
			case "mousedown":
				Self.startPuzzle({ el: $(event.target) });
				Self.getLimits();
				break;
			case "mousemove":
				let p1 = {
						x: Self.pos.origoX,
						y: Self.pos.origoY,
					},
					p2 = {
						x: event.clientX,
						y: event.clientY,
					},
					dirs = Self.getDirection(p2, p1);
				
				if (Self.direction !== dirs) {
					Self.getLimits(dirs);
				}

				let x2 = event.clientX - Self.pos.origoX,
					y2 = event.clientY - Self.pos.origoY;
				x2 = Math.min(Math.max(Self.pos.min.x, x2), Self.pos.max.x);
				y2 = Math.min(Math.max(Self.pos.min.y, y2), Self.pos.max.y);
				Self.els.neck.attr({ x2, y2 });
				Self.els.head.attr({ cx: x2, cy: y2 });
				// save head pos
				Self.pos.x = x2;
				Self.pos.y = y2;
				break;
		}
	},
	getCardinals(opt) {
		let [type, dir] = this.onEl.prop("classList")[0].split("-"),
			cardinals = "nwse".split("");
		return dir.split("").map(c => cardinals.indexOf(c));
	},
	getDirection(p1, p2) {
		let y = p1.y - p2.y,
			x = p1.x - p2.x,
			direction = Math.atan2(y, x) * (180/Math.PI);
		return Math.round(((direction + 450) % 360) / 90);
	},
	getLimits() {
		let dirs = this.getCardinals(),
			grid = this.puzzle.grid,
			span = this.puzzle.el.find("> span"),
			onIndex = this.onEl.index(),
			colIndex = onIndex % grid.cols,
			rowIndex = Math.floor(onIndex / grid.cols),
			rowEls = span.filter((e, i) => i >= rowIndex * grid.cols && i < (rowIndex + 1) * grid.cols),
			colEls = span.filter((e, i) => i % grid.cols == colIndex);

		console.log(dirs);
	}
};
