
let Snake = {
	init() {
		this.APP = witney;
		this.content = witney.content;
		this.doc = $(document);
	},
	start(event) {
		let puzzle = event.el.parents(".puzzle").addClass("started"),
			unit = parseInt(puzzle.cssProp("--unit"), 10),
			oW = puzzle.prop("offsetWidth"),
			oH = puzzle.prop("offsetHeight"),
			sX = +event.el.prop("offsetLeft") + 7,
			sY = +event.el.prop("offsetTop") + 7,
			sR = unit + 5,
			snake = [];
		// snake nest
		snake.push(`<circle class="nest" cx="${sX}" cy="${sY}" r="${sR}"/>`);
		snake.push(`<line class="neck" x1="${sX}" y1="${sY}" x2="${sX}" y2="${sY}"/>`);
		snake.push(`<circle class="head" cx="${sX}" cy="${sY}" r="${unit * .75}"/>`);

		// add snake to DOM
		let el = puzzle.append(`<svg class="snake" viewBox="0 0 ${oW} ${oH}">${snake.join("")}</svg>`),
			head = el.find(".head"),
			neck = el.find(".neck"),
			nest = el.find(".nest");
		this.els = { el, nest, head, neck, onEl: event.el };
		// fast references
		this.puzzle = {
			el: puzzle,
			offset: {
				width: oW,
				height: oH,
			},
			grid: {
				unit,
				width: +puzzle.cssProp("--width"),
				height: +puzzle.cssProp("--height"),
				cols: (+puzzle.cssProp("--width") * 2) + 1,
				rows: (+puzzle.cssProp("--height") * 2) + 1,
			},
		};

		this.origo = {
			x: event.clientX,
			y: event.clientY,
		};
		// get constraints
		this.getMaxMin();

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
			case "mousemove":
				let x2 = event.clientX - Self.origo.x,
					y2 = event.clientY - Self.origo.y;
				x2 = Math.min(Math.max(Self.origo.min.x, x2), Self.origo.max.x);
				y2 = Math.min(Math.max(Self.origo.min.y, y2), Self.origo.max.y);
				Self.els.neck.attr({ x2, y2 });
				Self.els.head.attr({ cx: x2, cy: y2 });
				break;
		}
	},
	getMaxMin() {
		let neck = this.els.neck,
			grid = this.puzzle.grid;
		
		// traverse from current element
		let span = this.puzzle.el.find("> span"),
			u2 = grid.unit / 2,
			onIndex = this.els.onEl.index(),
			colIndex = onIndex % grid.cols,
			rowIndex = Math.floor(onIndex / grid.rows),
			rowEls = span.filter((e, i) => i >= rowIndex * grid.cols && i < (rowIndex + 1) * grid.cols),
			colEls = span.filter((e, i) => i % grid.cols == colIndex);

		let min = {
				x: +this.els.onEl.prop("offsetLeft") + u2,
				y: +this.els.onEl.prop("offsetTop") + u2,
			},
			max = {
				x: +this.els.onEl.prop("offsetLeft") + u2,
				y: +this.els.onEl.prop("offsetTop") + u2,
			};
		colEls.map((el, i) => {
			if (i < rowIndex) min.y -= +el.offsetHeight;
			if (i > rowIndex) max.y += +el.offsetHeight;
		});

		rowEls.map((el, i) => {
			if (i < colIndex) min.x -= +el.offsetWidth;
			if (i > colIndex) max.x += +el.offsetWidth;
		});
		
		this.origo.min = min;
		this.origo.max = max;
	}
};
