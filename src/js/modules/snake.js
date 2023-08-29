
let Snake = {
	init() {
		this.APP = witney;
		this.content = witney.content;

		// temp
		// this.content.find(".puzzle").addClass("solved");

		// console.log( this.getDirection({ x: 0, y: 0 }, { x: 0, y: -2 }) ); // up
		// console.log( this.getDirection({ x: 0, y: 0 }, { x: 2, y: 0 }) ); // right
		// console.log( this.getDirection({ x: 0, y: 0 }, { x: 0, y: 2 }) ); // down
		// console.log( this.getDirection({ x: 0, y: 0 }, { x: -2, y: 0 }) ); // left
	},
	draw(opt) {
		let snake = [],
			body = [],
			oW = +opt.el.prop("offsetWidth"),
			oH = +opt.el.prop("offsetHeight"),
			unit = parseInt(opt.el.cssProp("--unit"), 10),
			cell = unit * 5,
			path = opt.path.split(";");
		// loop path points
		path.map((p, i) => {
			let [x,y,type] = p.split(",");
			x = x * cell;
			y = y * cell;
			// add point to snake body array
			body.push(`${x},${y}`);
			// snake nest
			if (type === "N") {
				snake.push(`<circle class="nest" cx="${x}" cy="${y}" r="${unit + 5}"/>`);
			}
			// snake head
			if (i === path.length-1) {
				snake.push(`<polyline class="body" points="${body.join(" ")}"/>`);
				snake.push(`<circle class="head" cx="${x}" cy="${y}" r="${unit * .5}""/>`);
			}
		});
		// add snake SVG to DOM
		opt.el
			.addClass("solved")
			.append(`<svg class="snake" viewBox="0 0 ${oW} ${oH}">${snake.join("")}</svg>`);
	},
	start(opt) {
		let puzzle = opt.el.parents(".puzzle").addClass("started debug"),
			oW = +puzzle.prop("offsetWidth"),
			oH = +puzzle.prop("offsetHeight"),
			oX = +opt.el.prop("offsetLeft"),
			oY = +opt.el.prop("offsetTop"),
			unit = parseInt(puzzle.cssProp("--unit"), 10),
			els = [];
		// snake body in points
		this.bodyPoints = [[oX, oY], [oX, oY]];
		// snake SVG
		els.push(`<circle class="nest" cx="${oX}" cy="${oY}" r="${unit + 5}"/>`);
		els.push(`<polyline class="body" points="${this.bodyPoints.join(" ")}"/>`);
		els.push(`<circle class="head" cx="${oX}" cy="${oY}" r="${unit * .5}""/>`);
		// used for debug purposes
		els.push(`<line class="debug0" x1="0" y1="0" x2="0" y2="0"/>`);
		els.push(`<line class="debug1" x1="0" y1="0" x2="0" y2="0"/>`);
		els.push(`<line class="debug2" x1="0" y1="0" x2="0" y2="0"/>`);
		els.push(`<line class="debug3" x1="0" y1="0" x2="0" y2="0"/>`);
		// add snake SVG to DOM
		let svg = puzzle.append(`<svg class="snake" viewBox="0 0 ${oW} ${oH}">${els.join("")}</svg>`);
		// fast references to snake parts
		this.els = {
			puzzle,
			nest: svg.find(".nest"),
			body: svg.find(".body"),
			head: svg.find(".head"),
			debug0: svg.find(".debug0"),
			debug1: svg.find(".debug1"),
			debug2: svg.find(".debug2"),
			debug3: svg.find(".debug3"),
			spans: puzzle.find("> span"),
		};
		// reference to element snake currently is on
		this.onEl = opt.el;
		// grid details
		this.grid = {
			unit,
			u2: unit / 2,
			width: +puzzle.cssProp("--width"),
			height: +puzzle.cssProp("--height"),
			cols: (+puzzle.cssProp("--width") * 2) + 1,
			rows: (+puzzle.cssProp("--height") * 2) + 1,
		};
		// span rectangles
		this.rects = this.els.spans.map(el => ({
			y: el.offsetTop,
			x: el.offsetLeft,
			width: el.offsetWidth,
			height: el.offsetHeight,
		}));
		// calculate max/min for all junctions
		// this.junctions = this.getJuntions();

		this.pos = {
			origo: [opt.clientX, opt.clientY],
			joint: [oX, oY],
		};

		// bind event handler
		this.content.bind("mousemove", this.dispatch);
	},
	dispatch(event) {
		let Self = Snake,
			APP = Self.APP,
			el;
		switch (event.type) {
			case "start-snake":

				// return Self.getMaxMin(event.offset(".puzzle"));

				if (!event.el.hasClass("started")) {
					el = $(event.target);
					if (!el.hasClass("entry")) return;
					return Self.start({ el, clientX: event.clientX, clientY: event.clientY });
				}

				// dispose snake & reset puzzle
				Self.els.puzzle.find("svg.snake").remove();
				Self.els.puzzle.removeClass("started");
				// reset app content
				Self.content.removeClass("cover");
				// bind event handler
				Self.content.unbind("mousemove", Self.dispatch);
				break;
			case "mousemove":
				let x1 = Self.pos.origo[0],
					y1 = Self.pos.origo[1],
					x2 = event.clientX,
					y2 = event.clientY,
					dir = Self.getDirection({ x: x1, y: y1 }, { x: x2, y: y2 }),
					step = dir % 2 === 0 ? y2 - y1 : x2 - x1;

				Self.move({ dir, step });
				break;
		}
	},
	move(opt) {
		let head = {
				x: +this.els.head.attr("cx"),
				y: +this.els.head.attr("cy"),
			},
			d = (opt.dir + 1) % 2,
			step = opt.step || 10,
			neck = this.bodyPoints[this.bodyPoints.length - 1],
			limit = this.getLimits(neck);

		neck[d] = this.pos.joint[d] + step;
		neck[0] = Math.min(Math.max(limit[3], neck[0]), limit[1]);
		neck[1] = Math.min(Math.max(limit[0], neck[1]), limit[2]);
		// neck[0] = Math.min(Math.max(limit.min.x, neck[0]), limit.max.x);
		// neck[1] = Math.min(Math.max(limit.min.y, neck[1]), limit.max.y);

		// this.APP.coords.val( JSON.stringify(limit) );

		let points = this.bodyPoints.join(" ");
		this.els.body.attr({ points });
		this.els.head.attr({ cx: neck[0], cy: neck[1] });
	},
	getJuntions() {
		let els = this.els.spans.filter(el => el.classList[0].startsWith("junc-") && !el.classList.contains("empty")),
			maxMins = els.map(el => this.getLimits($(el)));
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
	getElFromPos(pos) {
		let box = {
				x: pos[0] + this.grid.u2,
				y: pos[1] + this.grid.u2,
				width: 1,
				height: 1,
			},
			il = this.rects.length,
			i = 0;
		for (; i<il; i++) {
			let rect = this.rects[i];
			if (box.x < rect.x + rect.width &&
				box.x + box.width > rect.x &&
				box.y < rect.y + rect.height &&
				box.height + box.y > rect.y) {
				return $(this.els.spans[i]);
			}
		}
	},
	getSibling(el, dir) {
		let grid = this.grid,
			spans = this.els.spans,
			onIndex = el.index(),
			colIndex = onIndex % grid.cols,
			rowIndex = Math.floor(onIndex / grid.cols),
			rowEls = spans.filter((e, i) => i >= rowIndex * grid.cols && i < (rowIndex + 1) * grid.cols),
			colEls = spans.filter((e, i) => i % grid.cols == colIndex);
		switch (dir) {
			case 0: return colEls.get(rowIndex-1);
			case 1: return rowEls.get(colIndex+1);
			case 2: return colEls.get(rowIndex+1);
			case 3: return rowEls.get(colIndex-1);
		}
	},
	tread(opt) {
		let grid = this.grid,
			spans = this.els.spans,
			onIndex = opt.el.index(),
			colIndex = onIndex % grid.cols,
			rowIndex = Math.floor(onIndex / grid.cols),
			rowEls = spans.filter((e, i) => i >= rowIndex * grid.cols && i < (rowIndex + 1) * grid.cols),
			colEls = spans.filter((e, i) => i % grid.cols == colIndex),
			aboveEl, belowEl,
			leftEl, rightEl;
		
		switch (opt.d) {
			case 0:
				// elements above
				// for (let i=rowIndex; i>0; i--) {
				// 	aboveEl = colEls.get(i);
				// 	if (aboveEl.hasClass("break-*")) {
				// 		break;
				// 	}
				// }
				opt.limits[opt.d] = 0;
				break;
			case 2:
				// elements below
				for (let i=rowIndex, il=colEls.length; i<il; i++) {
					belowEl = colEls.get(i);
					if (belowEl.hasClass("break-*") && this.getSideV(belowEl, opt.pos) === "s") {
						// opt.limits[opt.d] = +belowEl.prop("offsetTop") + 7;
						console.log( belowEl );
						break;
					}
				}
				opt.limits[opt.d] = 161;
				break;

			case 1:
				// elements to the right
				for (let i=colIndex, il=rowEls.length; i<il; i++) {
					rightEl = rowEls.get(i);
					if (rightEl.hasClass("break-*") && this.getSideH(rightEl, opt.pos) === "e") {
						opt.limits[opt.d] = +rightEl.prop("offsetLeft") + 7;
						break;
					}
				}
				break;
			case 3:
				// elements to the left
				for (let i=colIndex; i>0; i--) {
					leftEl = rowEls.get(i);
					if (leftEl.hasClass("break-*") && this.getSideH(leftEl, opt.pos) === "w") {
						opt.limits[opt.d] = +leftEl.prop("offsetLeft") + +leftEl.prop("offsetWidth") - 21;
					}
				}
				break;
		}
		
		return opt;

		// let test = [0, 350, 220, 0];
		// return test[opt.d];
	},
	getSideH(el, pos) {
		let midH = +el.prop("offsetLeft") + (+el.prop("offsetWidth") >> 1);
		if (pos[0] < midH) return "e";
		if (pos[0] > midH) return "w";
	},
	getSideV(el, pos) {
		let midV = +el.prop("offsetTop") + (+el.prop("offsetHEight") >> 1);
		if (pos[1] < midV) return "n";
		if (pos[1] > midV) return "s";
	},
	getLimits(pos) {
		let el = this.getElFromPos(pos),
			dirs = this.getCardinals(el),
			limits = [
				pos[1], // up
				pos[0], // right
				pos[1], // down
				pos[0], // left
			];
		
		dirs.map(d => {
			let res = this.tread({ pos, el, d, limits });
			limits[d] = res.limits[d];
		});

		[...Array(4)].map((e,i) => this.els[`debug${i}`].attr({ x1: 0, y1: 0, x2: 0, y2: 0 }));
		if (dirs.includes(0)) this.els[`debug0`].attr({ x1: pos[0], y1: pos[1], x2: pos[0], y2: limits[0] });
		if (dirs.includes(1)) this.els[`debug1`].attr({ x1: pos[0], y1: pos[1], x2: limits[1], y2: pos[1] });
		if (dirs.includes(2)) this.els[`debug2`].attr({ x1: pos[0], y1: pos[1], x2: pos[0], y2: limits[2] });
		if (dirs.includes(3)) this.els[`debug3`].attr({ x1: pos[0], y1: pos[1], x2: limits[3], y2: pos[1] });

		// console.log( limits );
		return limits;
	}
};
