
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
			tX = +grid.el.prop("offsetLeft") - this.opt.oX + 9,
			tY = +grid.el.prop("offsetTop") - this.opt.oY + 9,
			total = 0,

			snake = [...grid.snake.snakeEl.childNodes];

		console.log( grid );
		// reset canvas
		this.cvs.attr({ width: this.opt.oW });
		this.ctx.strokeStyle = "#369";
		this.ctx.fillStyle = "#369";
		this.ctx.save();

		
		this.ctx.lineWidth = 2;
		this.ctx.beginPath();

		console.log( snake[0], +snake[0].getAttribute("cx"), +snake[0].getAttribute("cy") )
		tX += +snake[0].getAttribute("cx");
		tY += +snake[0].getAttribute("cy");
		this.ctx.moveTo(tX, tY);

		snake.slice(1).map(el => {
			let x1 = +el.getAttribute("x1"),
				y1 = +el.getAttribute("y1"),
				x2 = +el.getAttribute("x2"),
				y2 = +el.getAttribute("y2");
			// total length of snake
			// console.log(x1, y1, x2, y2);
			// total += this.dist(x1, y1, x2, y2);
			// // path of snake body
			// path.push([x2-x1, y2-y1]);

			// this.ctx.lineTo(point.x + x1, point.y + x2);
			// point.x += x2;
			// point.y += y2;

			tX += x2 - x1;
			tY += y2 - y1;
			this.ctx.lineTo(tX, tY);
		});

		// this.ctx.lineTo(200, 200);
		this.ctx.stroke()
	}
};
