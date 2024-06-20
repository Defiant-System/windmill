
let Particles = {
	init() {
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

		let Self = this;
		this.fpsControl = karaqu.FpsControl({
			fps: 35,
			callback() {
				// console.log("tick");
				Self.update();
				Self.render();
			}
		});
	},
	start(grid) {
		let line = parseInt(grid.el.cssProp("--line"), 10) >> 1,
			tx = +grid.el.prop("offsetLeft") + +grid.el.parent().prop("offsetLeft") - this.opt.oX + line,
			ty = +grid.el.prop("offsetTop") + +grid.el.parent().prop("offsetTop") - this.opt.oY + line,
			total = 0,
			path = [],
			snake = [...grid.snake.snakeEl.childNodes],
			sx = +snake[0].getAttribute("cx"),
			sy = +snake[0].getAttribute("cy");
		// console.log( grid );

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
			path.push({ px, py, dx, dy, sx, sy });
		});

		// set translate position, affecting origo
		this.tx = tx;
		this.ty = ty;
		// reset fireflies
		this.opt.flies = [];


		// prepare flies
		let il = total / 10 | 0,
			tl = total / il,
			rad = Math.PI,
			dist,
			ox = 0,
			oy = 0;
		[...Array(il)].map((e, i) => {
			let iC = i / il,
				index = iC * (path.length - 1),
				fractal = iC === 1 ? 1 : +index.toString().slice(1),
				pI = index | 0,
				p1 = path[pI],
				p2 = path[pI + 1],
				[nx, ny] = Utils.getPosOnLine(p1.sx, p1.sy, p2.sx, p2.sy, fractal),
				dist = Utils.dist(ox, oy, nx, ny);
			
			if (dist > tl) {
				// add new firefly to render queue
				this.opt.flies.push(new Firefly(this, nx, ny, rad));
				// remember new pos
				ox = nx;
				oy = ny;
			}
		});

		// start fpsControl
		// this.fpsControl.start();
		this.render();
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

		this.ctx.save();
		this.ctx.fillStyle = "#369";
		this.ctx.translate(this.tx, this.ty);

		this.opt.flies.map(fly => fly.render(this.ctx));

		this.ctx.restore();
	}
};
