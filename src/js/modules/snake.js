
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
		this.content.find(".puzzle").addClass("solved");

		// console.log( this.getDirection({ x: 0, y: 0 }, { x: 0, y: -2 }) ); // up
		// console.log( this.getDirection({ x: 0, y: 0 }, { x: 2, y: 0 }) ); // right
		// console.log( this.getDirection({ x: 0, y: 0 }, { x: 0, y: 2 }) ); // down
		// console.log( this.getDirection({ x: 0, y: 0 }, { x: -2, y: 0 }) ); // left
	},
	draw(opt) {
		let snake = [],
			o = {
				width: +opt.el.prop("offsetWidth"),
				height: +opt.el.prop("offsetHeight"),
			},
			unit = parseInt(opt.el.cssProp("--unit"), 10),
			segment = unit * 4,
			cell = unit * 5,
			x1, y1,
			x2, y2;
		// loop path
		opt.path.split(";").map(point => {
			let [x,y,type] = point.split(",");
			switch (type) {
				case "N":
					x2 = x * cell;
					y2 = y * cell;
					snake.push(`<circle class="nest" cx="${x2}" cy="${y2}" r="${unit + 5}"/>`);
					break;
				default:
					x1 = x2;
					y1 = y2;
					x2 = x * cell;
					y2 = y * cell;
					snake.push(`<line class="neck" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`);
			}
		});
		// append snake body to DOM
		opt.el.append(`<svg class="snake" viewBox="0 0 ${o.width} ${o.height}">${snake.join("")}</svg>`);
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
		// calculate max/min for all junctions
		this.puzzle.junctions = this.getJuntions();
		// reference to active el
		this.onEl = event.el.addClass("snake-body");
	},
	start(event) {
		let sX = +event.el.prop("offsetLeft"),
			sY = +event.el.prop("offsetTop"),
			unit = this.puzzle.grid.unit,
			snake = [];

		// prepare puzzle
		this.startPuzzle(event);

		// snake nest
		snake.push(`<circle class="nest" cx="${sX}" cy="${sY}" r="${unit + 5}"/>`);
		snake.push(`<line class="neck" x1="${sX}" y1="${sY}" x2="${sX}" y2="${sY}"/>`);
		snake.push(`<circle class="head" cx="${sX}" cy="${sY}" r="${unit * .5}"/>`);

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
		this.move({ type: "mousemove", clientX: event.clientX, clientY: event.clientY });

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
					onEl = Self.getOnEl(),
					dir = Self.getDirection(Self.pos.joint, { x, y });
				
				// if ((Self.pos.dir != dir || !Self.pos.min) && onEl.classList[0].startsWith("junc-")) {
				if (onEl.classList[0].startsWith("junc-")) {
					// console.log("on junction", onEl);
					let onIndex = Self.puzzle.junctions.els.indexOf(onEl),
						limit = Self.puzzle.junctions.maxMins[onIndex];
					
					if (dir == null) return;

					// Self.els.neck.attr({
					// 	x1: onEl.offsetLeft,
					// 	y1: onEl.offsetTop,
					// });

					Self.pos.dir = dir;
					Self.pos.min = { ...limit.min };
					Self.pos.max = { ...limit.max };
					Self.pos.joint = Self.pos.joint;

					if (dir % 2 === 0) {
						Self.pos.min.x =
						Self.pos.max.x = Self.pos.joint.x;
					} else {
						Self.pos.min.y =
						Self.pos.max.y = Self.pos.joint.y;
					}

					Self.onEl.removeClass("snake-body");
					Self.onEl = $(onEl).addClass("snake-body");
				}

				/*
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
				*/

				x = Math.min(Math.max(Self.pos.min.x, x), Self.pos.max.x);
				y = Math.min(Math.max(Self.pos.min.y, y), Self.pos.max.y);
				Self.els.neck.attr({ x2: x, y2: y });
				Self.els.head.attr({ cx: x, cy: y });
				break;
		}
	},
	getJuntions() {
		let els = this.puzzle.spans.filter(el => el.classList[0].startsWith("junc-") && !el.classList.contains("empty"));
		let maxMins = els.map(el => this.getLimits($(el)));
		return { els, maxMins };
	},
	getCardinals(el) {
		let [type, dir] = el.prop("classList")[0].split("-"),
			cardinals = "nwse".split("");
		return dir.split("").map(c => cardinals.indexOf(c));
	},
	getDirection(p1, p2) {
		let y = p1.y - p2.y,
			x = p1.x - p2.x,
			theta = Math.atan2(y, x) * (180/Math.PI);
		if (theta < 0) theta = 360 + theta;
		return y == 0 && x == 0 ? null : Math.max((Math.round(theta / 90) + 3) % 4, 0);
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
				head.height + head.y > rect.y) {
				return this.puzzle.spans[i];
			}
		}
	},
	getLimits(el) {
		let dirs = this.getCardinals(el),
			grid = this.puzzle.grid,
			span = this.puzzle.spans,
			onIndex = el.index(),
			colIndex = onIndex % grid.cols,
			rowIndex = Math.floor(onIndex / grid.cols),
			rowEls = span.filter((e, i) => i >= rowIndex * grid.cols && i < (rowIndex + 1) * grid.cols),
			colEls = span.filter((e, i) => i % grid.cols == colIndex),
			min = {
				x: +el.prop("offsetLeft"),
				y: +el.prop("offsetTop"),
			},
			max = {
				x: +el.prop("offsetLeft"),
				y: +el.prop("offsetTop"),
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
		// this.pos.min = min;
		// this.pos.max = max;
		return { min, max };
	}
};
