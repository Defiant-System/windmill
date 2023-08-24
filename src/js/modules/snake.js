
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
		// this.content.find(".puzzle").addClass("debug");
		// this.content.on("mousedown", ".puzzle", this.move);
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
			origo: {
				x: event.clientX,
				y: event.clientY,
			},
			joint: {
				x: sX,
				y: sY,
			},
		};
		// get constraints
		this.getLimits();

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
			// case "mousedown":
			// 	Self.startPuzzle({ el: $(event.target) });
			// 	Self.getLimits();
			// 	break;
			case "mousemove":
				let x2 = event.clientX - Self.pos.origo.x + Self.pos.joint.x,
					y2 = event.clientY - Self.pos.origo.y + Self.pos.joint.y;
				x2 = Math.min(Math.max(Self.pos.min.x, x2), Self.pos.max.x);
				y2 = Math.min(Math.max(Self.pos.min.y, y2), Self.pos.max.y);
				Self.els.neck.attr({ x2, y2 });
				Self.els.head.attr({ cx: x2, cy: y2 });
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
			colEls = span.filter((e, i) => i % grid.cols == colIndex),
			min = {
				x: +this.onEl.prop("offsetLeft") + grid.u2,
				y: +this.onEl.prop("offsetTop") + grid.u2,
			},
			max = {
				x: +this.onEl.prop("offsetLeft") + grid.u2,
				y: +this.onEl.prop("offsetTop") + grid.u2,
			};
		// horisontal - backwards from "onEl"
		for (let i=colIndex; i>0; i--) {
			if (rowEls[i-1].classList.contains("empty")) {
				colIndex -= i;
				rowEls = rowEls.splice(i);
				break;
			}
		}
		for (let i=colIndex; i>0; i--) {
			if (rowEls[i-1].classList.contains("break-we")) {
				colIndex -= i-1;
				rowEls = rowEls.splice(i-1);
				break;
			}
		}
		// horisontal - forwards from "onEl"
		for (let i=colIndex, il=rowEls.length; i<il; i++) {
			if (rowEls[i].classList.contains("empty")) {
				rowEls.splice(i);
				break;
			}
		}
		for (let i=colIndex, il=rowEls.length; i<il; i++) {
			if (rowEls[i].classList.contains("break-we")) {
				rowEls.splice(i+1);
				break;
			}
		}

		// vertical - backwards from "onEl"
		for (let i=rowIndex; i>0; i--) {
			if (colEls[i-1].classList.contains("empty")) {
				rowIndex -= i;
				colEls = colEls.splice(i);
				break;
			}
		}
		for (let i=rowIndex; i>0; i--) {
			if (colEls[i-1].classList.contains("break-ns")) {
				rowIndex -= i-1;
				colEls = colEls.splice(i-1);
				break;
			}
		}
		// vertical - forwards from "onEl"
		for (let i=rowIndex, il=colEls.length; i<il; i++) {
			if (colEls[i].classList.contains("empty")) {
				colEls.splice(i);
				break;
			}
		}
		for (let i=rowIndex, il=colEls.length; i<il; i++) {
			if (colEls[i].classList.contains("break-ns")) {
				colEls.splice(i+1);
				break;
			}
		}

		// decrease constraints
		if (dirs.includes(1) || dirs.includes(3)) {
			rowEls.map((el, i) => {
				if (i < colIndex) {
					min.x -= el.classList.contains("break-we")
							? grid.unit * 1.5
							: +el.offsetWidth;
				}
				if (i >= colIndex) {
					max.x += el.classList.contains("break-we")
							? grid.unit * 1.5
							: +el.offsetWidth;
				}
			});
		}
		if (dirs.includes(0) || dirs.includes(2)) {
			colEls.map((el, i) => {
				if (i < rowIndex) {
					min.y -= el.classList.contains("break-ns")
							? grid.unit * 1.5
							: +el.offsetHeight;
				}
				if (i >= rowIndex) {
					max.y += el.classList.contains("break-ns")
							? grid.unit * 1.5
							: +el.offsetHeight;
				}
			});
		}
		// console.log(min.x, max.x);
		// console.log(min.y, max.y);
		this.pos.min = min;
		this.pos.max = max;
	}
};
