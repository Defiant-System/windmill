
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
		let puzzle = opt.el.parents(".puzzle").addClass("started debug1"),
			oW = +puzzle.prop("offsetWidth"),
			oH = +puzzle.prop("offsetHeight"),
			oX = +opt.el.prop("offsetLeft"),
			oY = +opt.el.prop("offsetTop"),
			unit = parseInt(puzzle.cssProp("--unit"), 10),
			fat = parseInt(puzzle.cssProp("--fat"), 10),
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
		// grid details
		this.grid = {
			fat,
			unit,
			u2: unit / 2,
			width: +puzzle.cssProp("--width"),
			height: +puzzle.cssProp("--height"),
			cols: (+puzzle.cssProp("--width") * 2) + 1,
			rows: (+puzzle.cssProp("--height") * 2) + 1,
		};
		// span rectangles
		this.rects = this.els.spans.map(el => ({
			x: el.offsetLeft,
			y: el.offsetTop,
			width: el.offsetWidth,
			height: el.offsetHeight,
		}));

		this.pos = {
			origo: [opt.el.prop("offsetLeft"), opt.el.prop("offsetTop")],
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
				if (!event.el.hasClass("started")) {
					el = $(event.target);
					if (!el.hasClass("entry")) return;
					return Self.start({ el, layerX: +el.prop("offsetLeft"), layerY: +el.prop("offsetTop") });
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
				let neck = Self.bodyPoints[Self.bodyPoints.length - 1],
					x1 = Self.pos.origo[0],
					y1 = Self.pos.origo[1],
					x2 = event.layerX,
					y2 = event.layerY,
					dir = Self.getDirection({ x: neck[0], y: neck[1] }, { x: x2, y: y2 }),
					step = dir % 2 === 0 ? y2 - y1 : x2 - x1;

				// if (avail.includes(dir)) {
				// 	console.log(onEl);
				// }

				Self.move({ dir, step });
				break;
		}
	},
	move(opt) {
		let d = (opt.dir + 1) % 2,
			step = opt.step || 10,
			neck = this.bodyPoints[this.bodyPoints.length - 1],
			limit = this.getLimits(neck);

		neck[d] = this.pos.joint[d] + step;
		neck[0] = Math.min(Math.max(limit[3], neck[0]), limit[1]);
		neck[1] = Math.min(Math.max(limit[0], neck[1]), limit[2]);

		// this.APP.coords.val(neck.join());

		let points = this.bodyPoints.join(" ");
		this.els.body.attr({ points });
		this.els.head.attr({ cx: neck[0], cy: neck[1] });
	},
	getDistance(p1, p2) {
		let dx = p2[0] - p1[0],
			dy = p2[1] - p1[1];
		return Math.sqrt(dx * dx + dy * dy) | 0;
	},
	getCardinals(el) {
		let [type, dir] = el.prop("classList")[0].split("-"),
			cardinals = "nwse".split("");
		return dir ? dir.split("").map(c => cardinals.indexOf(c)) : false;
	},
	getDirection(p1, p2) {
		let y = p1.y - p2.y,
			x = p1.x - p2.x,
			theta = Math.atan2(y, x) * (180/Math.PI);
		if (theta < 0) theta = 360 + theta;
		return Math.max((Math.round(theta / 90) + 3) % 4, 0);
		// return y == 0 && x == 0 ? this.direction : Math.max((Math.round(theta / 90) + 3) % 4, 0);
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
	getSideH(el, pos) {
		let midH = +el.prop("offsetLeft") + (+el.prop("offsetWidth") >> 1);
		if (pos[0] < midH) return "e";
		if (pos[0] > midH) return "w";
	},
	getSideV(el, pos) {
		let midV = +el.prop("offsetTop") + (+el.prop("offsetHeight") >> 1);
		if (pos[1] < midV) return "n";
		if (pos[1] > midV) return "s";
	},
	getLimits(pos) {
		let el = this.getElFromPos(pos),
			dirs = this.getCardinals(el),
			spans = this.els.spans,
			grid = this.grid,
			unit = grid.unit,
			fat = grid.fat,
			u2 = unit * .5,
			p2 = ((unit * fat) - unit) / 2,
			onIndex = el.index(),
			colIndex = onIndex % grid.cols,
			rowIndex = Math.floor(onIndex / grid.cols),
			rowEls = spans.filter((e, i) => i >= rowIndex * grid.cols && i < (rowIndex + 1) * grid.cols),
			colEls = spans.filter((e, i) => i % grid.cols == colIndex),
			limits = [
				+el.prop("offsetTop"), // up
				+el.prop("offsetLeft"), // right
				+el.prop("offsetTop") + +el.prop("offsetHeight") - unit, // down
				+el.prop("offsetLeft") + +el.prop("offsetWidth") - unit, // left
			];
		
		dirs.map(d => {
			let sibling;
			switch (d) {
				case 0:
					// elements above
					sibling = colEls.get(0);
					limits[d] = +sibling.prop("offsetTop");
					for (let i=rowIndex; i>0; i--) {
						sibling = colEls.get(i);
						if (sibling.hasClass("empty")) {
							limits[d] = +colEls.get(i+1).prop("offsetTop");
							break;
						}
						if (sibling.hasClass("break-*") && this.getSideV(sibling, pos) === "s") {
							limits[d] = +sibling.prop("offsetTop") + +sibling.prop("offsetHeight") - p2;
							break;
						}
					}
					break;
				case 2:
					// elements below
					sibling = colEls.get(colEls.length-1);
					limits[d] = +sibling.prop("offsetTop") + sibling.prop("offsetHeight") - unit;
					for (let i=rowIndex, il=colEls.length; i<il; i++) {
						sibling = colEls.get(i);
						if (sibling.hasClass("empty")) {
							sibling = colEls.get(i-1);
							limits[d] = +sibling.prop("offsetTop") + +sibling.prop("offsetHeight") - unit;
							break;
						}
						if (sibling.hasClass("break-*") && this.getSideV(sibling, pos) === "n") {
							limits[d] = +sibling.prop("offsetTop") + u2;
							break;
						}
					}
					break;

				case 1:
					// elements to the right
					sibling = rowEls.get(rowEls.length-1);
					limits[d] = +sibling.prop("offsetLeft") + sibling.prop("offsetWidth") - unit;
					for (let i=colIndex, il=rowEls.length; i<il; i++) {
						sibling = rowEls.get(i);
						if (sibling.hasClass("empty")) {
							sibling = rowEls.get(i-1);
							limits[d] = +sibling.prop("offsetLeft");
							break;
						}
						if (sibling.hasClass("break-*") && this.getSideH(sibling, pos) === "e") {
							limits[d] = +sibling.prop("offsetLeft") + u2;
							break;
						}
					}
					break;
				case 3:
					// elements to the left
					sibling = rowEls.get(0);
					limits[d] = +sibling.prop("offsetLeft");
					for (let i=colIndex; i>0; i--) {
						sibling = rowEls.get(i);
						if (sibling.hasClass("empty")) {
							limits[d] = +rowEls.get(i+1).prop("offsetLeft");
							break;
						}
						if (sibling.hasClass("break-*") && this.getSideH(sibling, pos) === "w") {
							limits[d] = +sibling.prop("offsetLeft") + +sibling.prop("offsetWidth") - p2;
							break;
						}
					}
					break;
			}
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
