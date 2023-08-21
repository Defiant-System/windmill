
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

		lvl[opt.name].split(",").map(cell => {
			let names = cell.split(";").map(p => lexer[p]).join(" ");
			out.push(`<span class="${names}"></span>`);
		});

		opt.el.html(out.join(""));
	}
};
