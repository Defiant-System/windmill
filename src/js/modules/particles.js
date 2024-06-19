
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
			hPI: 180 / Math.PI,
			tau: Math.PI * 2,
			dots: [...Array(35)].map(e => Math.random()).map(e => e < .05 ? e + .05 : e),
		};
		// update dimensions
		this.cvs.attr({
			width: this.opt.oW,
			height: this.opt.oH,
		});
	},
	dist(x1, y1, x2, y2) {
		return Math.sqrt(Math.pow((x1-x2), 2) + Math.pow((y1-y2), 2));
	},
	getPosOnLine(x1, y1, x2, y2, perc) {
		return [ x1 * (1.0 - perc) + x2 * perc, y1 * (1.0 - perc) + y2 * perc ];
	},
	getDirection(x1, y1, x2, y2) {
		let theta = Math.atan2(y1 - y2, x1 - x2) * this.opt.hPI;
		return theta < 0 ? theta = 360 + theta : theta;
	},
	start(grid) {
		let line = parseInt(grid.el.cssProp("--line"), 10),
			tx = +grid.el.prop("offsetLeft") - this.opt.oX + (line >> 1),
			ty = +grid.el.prop("offsetTop") - this.opt.oY + (line >> 1),
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
			total += this.dist(x1, y1, x2, y2);
			// path of snake body
			sx += px * dx;
			sy += py * dy;
			path.push({ px, py, dx, dy, sx, sy });
		});

		// reset canvas
		this.cvs.attr({ width: this.opt.oW });

		this.ctx.save();
		// this.ctx.lineWidth = 2;
		// this.ctx.strokeStyle = "#369";
		this.ctx.fillStyle = "#369";
		this.ctx.translate(tx, ty);

		// this.ctx.beginPath();
		// this.ctx.moveTo(path[0].sx, path[0].sy);
		// path.slice(1).map(point => {
		// 	this.ctx.lineTo(point.sx, point.sy);
		// });
		// this.ctx.stroke();

		this.opt.dots.map(e => {
			let measure = 0,
				target = total * e,
				x, y,
				dir;

			// calculate percentage position on line segment
			for (let i=0, il=path.length-1; i<il; i++) {
				let p1 = path[i],
					p2 = path[i+1],
					d = this.dist(p1.px, p1.py, p2.px, p2.py);
				if (measure + d < target) {
					measure += d;
				} else {
					let p = (target - measure) / d;
					[x, y] = this.getPosOnLine(p1.px, p1.py, p2.px, p2.py, p);
					dir = this.getDirection(p1.px, p1.py, p2.px, p2.py);
					break;
				}
			}

			// horizontal
			if (dir % 180 === 0) y += (Math.random() * 2 | 0 ? 1 : -1) * line * .5;
			// vertical
			else x += (Math.random() * 2 | 0 ? 1 : -1) * line * .5;

			this.ctx.beginPath();
			this.ctx.arc(x, y, 3, 0, this.opt.tau);
			this.ctx.fill();
		});

		this.ctx.restore();
	}
};
