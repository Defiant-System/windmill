
let Particles = {
	init() {
		this.cvs = window.find(".particles");
		this.ctx = this.cvs[0].getContext("2d", { willReadFrequently: true });
		// this options
		this.opt = {
			oX: this.cvs.prop("offsetLeft"),
			oY: this.cvs.prop("offsetTop"),
			oW: this.cvs.prop("offsetWidth"),
			oH: this.cvs.prop("offsetHeight"),
			radius: 3,
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
		let path = [],
			gW = parseInt(grid.el.cssProp("--gW"), 10),
			gH = parseInt(grid.el.cssProp("--gH"), 10),
			line = parseInt(grid.el.cssProp("--line"), 10),
			tX = +grid.el.prop("offsetLeft") + (gW / 2) + .5,
			tY = +grid.el.prop("offsetTop") + (gH / 2) + .5,
			total = 0;

		grid.snake.snakeEl.childNodes.map(el => {
			let isStart = el.nodeName === "circle",
				x1 = +el.getAttribute(isStart ? "x" : "x1"),
				y1 = +el.getAttribute(isStart ? "y" : "y1"),
				x2 = +el.getAttribute(isStart ? "x" : "x2"),
				y2 = +el.getAttribute(isStart ? "y" : "y2");
			// total length of snake
			// console.log(x1, y1, x2, y2);
			total += this.dist(x1, y1, x2, y2);
			// path of snake body
			path.push([x2-x1, y2-y1]);
		});

		console.log( JSON.stringify(path) );

		// reset canvas
		this.cvs.attr({ width: this.opt.oW });
		this.ctx.fillStyle = "#f00";
		this.ctx.save();
		this.ctx.translate(tX + 71, tY + 126);

		this.opt.dots.map(e => {
			let measure = 0,
				target = total * e,
				x, y,
				dir;

			// calculate percentage position on line segment
			for (let i=0, il=path.length-1; i<il; i++) {
				let d = this.dist(...path[i], ...path[i+1]);
				if (measure + d < target) {
					measure += d;
				} else {
					let p = (target - measure) / d;
					[x, y] = this.getPosOnLine(...path[i], ...path[i+1], p);
					dir = this.getDirection(...path[i], ...path[i+1]);
					break;
				}
			}

			// horizontal
			if (dir % 180 === 0) y += (Math.random() * 2 | 0 ? 1 : -1) * line * .5;
			// vertical
			else x += (Math.random() * 2 | 0 ? 1 : -1) * line * .5;

			this.ctx.beginPath();
			this.ctx.arc(x, y, this.opt.radius, 0, this.opt.tau);
			this.ctx.fill();
		});
	}
};
