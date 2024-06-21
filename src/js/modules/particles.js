
let Particles = {
	init() {
		this.star = window.find(".star");
		this.cvs = window.find(".particles");
		this.ctx = this.cvs[0].getContext("2d", { willReadFrequently: true });
		// this options
		this.opt = {
			oX: +this.cvs.prop("offsetLeft"),
			oY: +this.cvs.prop("offsetTop"),
			oW: +this.cvs.prop("offsetWidth"),
			oH: +this.cvs.prop("offsetHeight"),
		};
		// update dimensions
		this.cvs.attr({
			width: this.opt.oW,
			height: this.opt.oH,
		});

		// console.log( "n", Utils.getDirection(0, 0, 0, -1) );
		// console.log( "w", Utils.getDirection(0, 0, 1, 0) );
		// console.log( "s", Utils.getDirection(0, 0, 0, 1) );
		// console.log( "e", Utils.getDirection(0, 0, -1, 0) );

		let Self = this;
		this.fpsControl = karaqu.FpsControl({
			fps: 45,
			callback() {
				// console.log("tick");
				Self.update();
				Self.render();
			}
		});
	},
	reset() {
		// reset canvas
		this.cvs.attr({ width: this.opt.oW });
	},
	start(grid) {
		let line = parseInt(grid.el.cssProp("--line"), 10) >> 1,
			tx = +grid.el.prop("offsetLeft") + +grid.el.parent().prop("offsetLeft") - this.opt.oX + line,
			ty = +grid.el.prop("offsetTop") + +grid.el.parent().prop("offsetTop") - this.opt.oY + line,
			total = 0,
			path = [],
			dots = [],
			snake = [...grid.snake.snakeEl.childNodes],
			hr = +snake[0].getAttribute("r"),
			hx = +snake[0].getAttribute("cx"),
			hy = +snake[0].getAttribute("cy"),
			sx = hx,
			sy = hy;

		// star offset
		this.oStar = this.star.offset(".start-view");

		// snake head
		[...Array(5)].map(e => dots.push({ x: sx, y: sy }));

		// calculate "total" & accumulate snake path
		snake.map(el => {
			let x1 = +el.getAttribute("x1"),
				y1 = +el.getAttribute("y1"),
				x2 = +el.getAttribute("x2"),
				y2 = +el.getAttribute("y2"),
				px = x2 - x1,
				py = y2 - y1,
				dx = (sx > x1 ? -1 : 1),
				dy = (sy > y1 ? -1 : 1);

			// total length of snake
			total += Utils.dist(x1, y1, x2, y2);
			// path of snake body
			sx += px * dx;
			sy += py * dy;

			path.push({ sx, sy });
		});

		// set translate position, affecting origo
		this.tx = tx;
		this.ty = ty;
		// reset fireflies
		this.opt.flies = [];

		// prepare flies
		let hPI = Math.PI * .5,
			compass = [hPI, Math.PI, -hPI, 0],
			il = total / 10 | 0,
			ox = 0,
			oy = 0;
		
		// line segments
		[...Array(il)].map((e, i) => {
			let iC = i / il,
				index = iC * (path.length - 1),
				fractal = "."+ (index.toString().split(".")[1] || 0),
				p1 = path[(index | 0)],
				p2 = path[(index | 0) + 1],
				[x, y] = Utils.getPosOnLine(p1.sx, p1.sy, p2.sx, p2.sy, +fractal),
				dir = Utils.getDirection(p1.sx, p1.sy, p2.sx, p2.sy),
				rnd = Utils.random(0, 2) ? 1 : -1,
				rr = (Math.random() - .5) * Math.PI * .35,
				normal = compass[dir] + (dir > 1 ? Math.PI : -Math.PI);
			
			if ([0,2].includes(dir)) {
				// horizontal
				x += rnd * line;
			} else {
				// vertical
				y += rnd * line;
			}
			// final arithmetics for nomral
			normal += (hPI * rnd) * (dir < 2 ? 1 : -1) + rr;
			// accumulate dot details
			dots.push({ x, y, normal });
		});

		// push out flies in "head area"
		let hd;
		switch (Utils.getDirection(path[0].sx, path[0].sy, path[1].sx, path[1].sy)) {
			case Compass.NORTH: hd = -hPI; break; // north
			case Compass.WEST: hd = Math.PI * .25; break; // west
			case Compass.SOUTH: hd = hPI; break; // south
			case Compass.EAST: hd = Math.PI * .75; break; // east
		}
		dots.map(dot => {
			let dist = Utils.dist(hx, hy, dot.x, dot.y);
			if (dist < hr) {
				let rad = (Math.random() * Math.PI * 1.5) + hd,
					{ x, y } = Utils.getXYFromRadAngle(hr, rad);
				dot.x = hx + x;
				dot.y = hy + y;
				dot.normal = rad;
			}
		});

		// add new firefly to render queue
		dots.map(item => this.opt.flies.push(new Firefly(this, item)));

		// start fpsControl
		this.fpsControl.start();
		// this.render();
	},
	remove(fly) {
		let index = this.opt.flies.indexOf(fly);
		this.opt.flies.splice(index, 1);
		
		if (!this.opt.flies.length) {
			this.fpsControl.stop();
			// console.log("stopped");
		}
	},
	update() {
		this.opt.flies.map(fly => fly.update());
	},
	render() {
		// reset canvas
		this.cvs.attr({ width: this.opt.oW });

		// this.ctx.save();
		this.ctx.fillStyle = "#fff";
		this.ctx.translate(this.tx, this.ty);
		this.opt.flies.map(fly => fly.render(this.ctx));
		// this.ctx.restore();
	}
};
