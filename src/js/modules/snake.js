
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

		// let p1 = { x: 0, y: 0 },
		// 	p2 = { x: -2, y: 10 },
		// 	dir = this.getDirection(p1, p2);
		// console.log(dir);
	},
	startPuzzle(event) {
		let puzzle = event.el.parents(".puzzle").addClass("started"),
			unit = parseInt(puzzle.cssProp("--unit"), 10),
			spans = puzzle.find("> span");
		// fast references
		this.puzzle = {
			el: puzzle,
			spans,
			rects: spans.map(el => ({
				y: el.offsetTop,
				x: el.offsetLeft,
				width: el.offsetWidth,
				height: el.offsetHeight,
			})),
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
		this.onEl = event.el.addClass("snake-body");
	},
	start(event) {
		let sX = +event.el.prop("offsetLeft"),
			sY = +event.el.prop("offsetTop"),
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
		// this.setLimits();

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
				// reset "onEl"
				Self.onEl.removeClass("snake-body");
				// reset app content
				Self.content.removeClass("cover");
				// bind event handler
				Self.doc.unbind("click mousemove", Self.move);
				break;
			case "mousemove":
				let x = event.clientX - Self.pos.origo.x + Self.pos.joint.x,
					y = event.clientY - Self.pos.origo.y + Self.pos.joint.y,
					onEl = Self.getOnEl();

				let p1 = { x: event.clientX, y: event.clientY },
					p2 = Self.pos.origo,
					d = Self.getDirection(p1, p2);

				if (!Self.pos.min || onEl && onEl.el[0] !== Self.onEl[0] && onEl.el.hasClass("junc-*")) {
					Self.setLimits(d);

					if (Self.onEl) Self.onEl.removeClass("snake-body");
					if (onEl) Self.onEl = onEl.el.addClass("snake-body");

					// let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
					// line.setAttribute("x1", Self.els.neck.attr("x1"));
					// line.setAttribute("y1", Self.els.neck.attr("y1"));
					// line.setAttribute("x2", Self.els.neck.attr("x2"));
					// line.setAttribute("y2", Self.els.neck.attr("y2"));
					// Self.els.neck.before(line);

					// let x1 = onEl.rect.x,
					// 	y1 = onEl.rect.y;
					// Self.els.neck.attr({ x1, y1 });
				}

				x = Math.min(Math.max(Self.pos.min.x, x), Self.pos.max.x);
				y = Math.min(Math.max(Self.pos.min.y, y), Self.pos.max.y);
				Self.els.neck.attr({ x2: x, y2: y });
				Self.els.head.attr({ cx: x, cy: y });
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
			theta = Math.atan2(y, x) * (180/Math.PI);
		if (theta < 0) theta = 360 + theta;
		return y == 0 && x == 0 ? null : [Math.max((Math.round(theta / 90) - 1) % 4, 0)];
	},
	getOnEl() {
		let head = this.els.head[0].getBBox();
		head.x += this.puzzle.grid.u2 + 2;
		head.y += this.puzzle.grid.u2 + 2;
		head.width -= 4;
		head.height -= 4;
		for (let i=0, il=this.puzzle.rects.length; i<il; i++) {
			let rect = this.puzzle.rects[i];
			if (head.x < rect.x + rect.width &&
				head.x + head.width > rect.x &&
				head.y < rect.y + rect.height &&
				head.height + head.y > rect.y &&
				this.onEl[0] !== this.puzzle.spans[i]) {
				return { rect, el: $(this.puzzle.spans[i]) };
			}
		}
	},
	setLimits(d) {
		let dirs = d || this.getCardinals(),
			grid = this.puzzle.grid,
			span = this.puzzle.spans,
			onIndex = this.onEl.index(),
			colIndex = onIndex % grid.cols,
			rowIndex = Math.floor(onIndex / grid.cols),
			rowEls = span.filter((e, i) => i >= rowIndex * grid.cols && i < (rowIndex + 1) * grid.cols),
			colEls = span.filter((e, i) => i % grid.cols == colIndex),
			min = {
				x: +this.onEl.prop("offsetLeft"),
				y: +this.onEl.prop("offsetTop"),
			},
			max = {
				x: +this.onEl.prop("offsetLeft"),
				y: +this.onEl.prop("offsetTop"),
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
		// vertical - forwards from "onEl"
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
			max.x -= grid.unit;
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
			max.y -= grid.unit;
		}
		// console.log(min.x, max.x);
		// console.log(min.y, max.y);
		this.pos.min = min;
		this.pos.max = max;
	}
};
