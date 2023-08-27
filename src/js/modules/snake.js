
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
		let puzzle = opt.el.parents(".puzzle").addClass("started"),
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
		// add snake SVG to DOM
		let svg = puzzle.append(`<svg class="snake" viewBox="0 0 ${oW} ${oH}">${els.join("")}</svg>`);
		// fast references to snake parts
		this.els = {
			puzzle,
			nest: svg.find(".nest"),
			body: svg.find(".body"),
			head: svg.find(".head"),
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
		neck[0] = Math.min(Math.max(limit.min.x, neck[0]), limit.max.x);
		neck[1] = Math.min(Math.max(limit.min.y, neck[1]), limit.max.y);

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
	getLimits(pos) {
		let el = this.getElFromPos(pos),
			dirs = this.getCardinals(el),
			p = "offsetTop offsetLeft".split(" "),
			y = +el.prop(p[0]),
			x = +el.prop(p[1]),
			limits = [
				y, // up
				x, // right
				y, // down
				x, // left
			];
		
		dirs.map(d => {
			let sibling = this.getSibling(el, d);
			while (sibling.length) {
				limits[d] = +sibling.prop(p[d%2]);
				sibling = this.getSibling(sibling, d);
			}
		});

		console.log( limits );

		return { min: { x: 0, y: 0 }, max: { x: 0, y: 210 } };
		// return { min, max };
	}
};
