
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
		let grid = opt.dim ? this.generate(opt.dim) : lvl[opt.name];

		grid.split(",").map(cell => {
			let names = cell.split(";").map(p => lexer[p]).join(" ");
			out.push(`<span class="${names}"></span>`);
		});

		opt.el.html(out.join(""));
	},
	generate(dim) {
		let [w, h] = dim.split("x").map(i => +i),
			out = [];

		[...Array(h)].map((row, y) => {
			let ctl = y === 0 ? "jws" : "jnws",
				ctr = y === 0 ? "jse" : "jnse";
			out.push(`${ctl},pwe,jwse,pwe,jwse,pwe,${ctr}`);
			out.push("pns,b,pns,b,pns,b,pns");
		});
		out.push("jnw;E,pwe,jnwe,pwe,jnwe,pwe,jne");

		return out.join(",");
	}
};
