
let lexer = {
	"jnwse": "junc-nwse",
	"jnse": "junc-nse",
	"jnws": "junc-nws",
	"jwse": "junc-wse",
	"jnwe": "junc-nwe",
	"jse": "junc-se",
	"jws": "junc-ws",
	"jne": "junc-ne",
	"jnw": "junc-nw",
	"jn": "junc-n",
	"js": "junc-s",
	"je": "junc-e",
	"jw": "junc-w",
	"pwe": "path-we",
	"pns": "path-ns",
	"bwe": "break-we",
	"bns": "break-ns",
	"b": "box",
	"e": "empty",
	"E": "entry",
	"X": "exit",
	"Xn": "exit n",
	"Xw": "exit w",
	"Xs": "exit s",
	"Xe": "exit e",
};

let Maps = {
	draw(opt) {
		let out = [];
		let grid = opt.gen ? this.generate(opt.gen) : lvl[opt.name];
		let info = grid.split("]")[0].slice(1);
		let dim = {
				"--width": info.split("x")[0],
				"--height": info.split("x")[1],
			};

		grid.slice(info.length+2).split(",").map(cell => {
			let names = cell.split(";").map(p => lexer[p]).join(" ");
			out.push(`<span class="${names}"></span>`);
		});

		opt.el.css(dim).html(out.join(""));
	},
	generate(dim) {
		let [w, h] = dim.split("x").map(i => +i),
			out = [];

		[...Array(h)].map((r, y) => {
			let row = [],
				ctl = y === 0 ? "jws" : "jnws",
				ctr = y === 0 ? "jse" : "jnse";
			// top lines
			row.push(`${ctl},pwe`);
			[...Array(w-1)].map((c, x) => row.push(`jwse,pwe`));
			row.push(ctr);
			out.push(row.join(","));
			// boxes
			row = [`pns,b`];
			[...Array(w-1)].map((c, x) => row.push(`pns,b`));
			row.push(`pns`);
			out.push(row.join(","));
		});
		// bottom / last line
		let row = [`jnw;E,pwe`];
		[...Array(w-1)].map((c, x) => row.push(`jnwe,pwe`));
		row.push(`jne`);
		out.push(row.join(","));

		return `[${w}x${h}]`+ out.join(",");
	}
};
