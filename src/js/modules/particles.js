
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
	},
	start(grid) {
		let line = parseInt(grid.el.cssProp("--line"), 10) >> 1,
			tx = +grid.el.prop("offsetLeft") - this.opt.oX + line,
			ty = +grid.el.prop("offsetTop") - this.opt.oY + line,
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

		this.tx = tx;
		this.ty = ty;

		// reset fireflies
		this.opt.flies = [];

		// prepare flies
		[...Array(total/10|0)].map(e => {
			let measure = -20,
				target = total * Math.random(),
				x, y,
				dir;

			// calculate percentage position on line segment
			for (let i=0, il=path.length-1; i<il; i++) {
				let p1 = path[i],
					p2 = path[i+1],
					d = Utils.dist(p1.px, p1.py, p2.px, p2.py);
				if (measure + d < target) {
					measure += d;
				} else {
					let p = (target - measure) / d;
					[x, y] = Utils.getPosOnLine(p1.sx, p1.sy, p2.sx, p2.sy, p);
					dir = Utils.getDirection(p1.sx, p1.sy, p2.sx, p2.sy);
					break;
				}
			}

			let r = Utils.random(0, 2) ? 1 : -1;
			if (dir % 180 === 0) y += r * line; // horizontal
			else x += r * line; // vertical

			// add new firefly to render queue
			this.opt.flies.push(new Firefly(x, y, 50, 50));
		});

		this.render(this.ctx);
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
