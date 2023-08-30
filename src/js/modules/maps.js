
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

	"jwe": "junc-we",
	"jns": "junc-ns",

	"pwe": "path-we",
	"pns": "path-ns",
	"bwe": "break-we",
	"bns": "break-ns",

	"B": "black",
	"W": "white",
	"C": "cyan",
	"M": "magenta",
	"Y": "yellow",
	"R": "red",
	"G": "green",
	"N": "navy",
	"O": "orange",

	"D": "dot",
	"S": "star",
	"h": "hex",
	"b": "box",

	"e": "empty",
	"E": "entry",
	"X": "exit",
	"xn": "exit xn",
	"xw": "exit xw",
	"xs": "exit xs",
	"xe": "exit xe",
};

let Maps = {
	draw(opt) {
		let out = [];
		let grid = opt.gen ? this.generate(opt.gen) : lvl[opt.name];
		let info = grid.split("]")[0].slice(1);
		let [w,h,u,f] = info.split("x");
		let dim = {
				"--width": w || 3,
				"--height": h || 3,
				"--unit": `${u || 14}px`,
				"--fat": f || 4,
			};

		grid.slice(info.length+2).split(",").map(cell => {
			let names = cell.split(";").map(p => lexer[p]).join(" ");
			out.push(`<span class="${names}"></span>`);
		});

		opt.el.css(dim).html(out.join(""));
	},
	generate(dim) {
		let [w, h, u] = dim.split("x").map(i => +i),
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

		return `[${w}x${h}x${u || 14}]`+ out.join(",");
	},
	pgn(puzzle) {
		let w = puzzle.cssProp("--width"),
			h = puzzle.cssProp("--height"),
			out = [];
		puzzle.find("> span").map(el => {
			let block = [];
			el.classList.forEach(name => {
				let short = Object.keys(lexer).map(k => {
					if (lexer[k] === name) {
						let exitRx = el.className.match(/\sxn|\sxw|\sxs|\sxe/ig);
						if (name === "exit" && exitRx) {
							block.push(exitRx[0].trim());
						} else {
							block.push(k);
						}
					}
				});
			});
			out.push(block.join(";"));
		});
		out = `[${w}x${h}]${out.join(",")}`;
		
		return out;
	}
};
