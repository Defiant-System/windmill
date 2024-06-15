
let Particles = {
	init() {
		this.cvs = window.find(".particles");
		this.ctx = this.cvs[0].getContext("2d", { willReadFrequently: true });
		// this options
		this.opt = {
			oW: this.cvs.prop("offsetWidth"),
			oH: this.cvs.prop("offsetHeight"),
			radius: 3,
			tau: Math.PI * 2,
			dots: [...Array(45)].map(e => Math.random()).map(e => e < .05 ? e + .05 : e),
		};
		// update dimensions
		this.cvs.attr({
			width: this.opt.oW,
			height: this.opt.oH,
		});
	},
	dist(x1, y1, x2, y2) {
		return Math.sqrt(Math.pow((x1-x2), 2) + Math.pow((y1-y2), 2))
	},
	getPosOnLine(x1, y1, x2, y2, perc) {
		return [ x1 * (1.0 - perc) + x2 * perc, y1 * (1.0 - perc) + y2 * perc ]
	},
	getDirection(x1, y1, x2, y2) {
		let theta = Math.atan2(y1 - y2, x1 - x2) * (180 / Math.PI);
		return theta < 0 ? theta = 360 + theta : theta;
	},
	setup(opt) {
		let path = [],
			unit = parseInt(opt.el.cssProp("--unit"), 10),
			tX = +opt.el.prop("offsetLeft") + (unit / 2) + .5,
			tY = +opt.el.prop("offsetTop") + (unit / 2) + .5,
			cell = unit * 5,
			total = 0,
			nest;

		// loop path
		opt.path.split(";").map(point => {
			let [x,y,t] = point.split(","),
				pos = [x * cell, y * cell];
			if (t === "N") nest = pos;
			// save for later use
			path.push(pos);
		});

		// calculate total line segment
		path.slice(0,-1).map((e, i) => total += this.dist(...path[i], ...path[i+1]));
	
		this.ctx.clearRect(0, 0, this.opt.oW, this.opt.oH);
		this.ctx.fillStyle = "#fff";
		this.ctx.save();
		this.ctx.translate(tX, tY);

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
			if (dir % 180 === 0) y += (Math.random() * 2 | 0 ? 1 : -1) * unit >> 1;
			// vertical
			else x += (Math.random() * 2 | 0 ? 1 : -1) * unit >> 1;

			this.ctx.beginPath();
			this.ctx.arc(x, y, this.opt.radius, 0, this.opt.tau, true);
			this.ctx.fill();
		});

		// snake nest
		[...Array(this.opt.dots.length * .15 | 0)].map(e => {
			let a = Math.random() * 360 | 0,
				r = unit + 7 - (this.opt.radius * .5),
				x = nest[0] + r * Math.cos(a),
				y = nest[1] + r * Math.sin(a);
			this.ctx.beginPath();
			this.ctx.arc(x, y, this.opt.radius, 0, this.opt.tau, true);
			this.ctx.fill();
		});

		this.ctx.restore();

		this.opt.tX = +opt.el.prop("offsetLeft") + (unit / 2) + .5,
		this.opt.tY = +opt.el.prop("offsetTop") + (unit / 2) + .5,
		this.opt.color = opt.el.cssProp("--snake");
	}
};
