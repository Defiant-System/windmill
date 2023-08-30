
@import "modules/sample.js";
@import "modules/levels.js";
@import "modules/maps.js";
@import "modules/particles.js";
@import "modules/snake.js";


let Input = {
	keys: "UP RIGHT DOWN LEFt".split(" "),
	key: {},
};


const witney = {
	init() {
		// fast references
		this.content = window.find("content");
		this.coords = window.find(`.tools input[name="coords"]`);
		// init sub objects
		Particles.init();
		Snake.init();

		// Maps.draw({ name: "level1a-H", el: window.find(".puzzle.p1").addClass("show") });
		// Maps.draw({ name: "level1b-H", el: window.find(".puzzle.p2").addClass("show") });
		// Maps.draw({ name: "level1a-V", el: window.find(".puzzle.p3").addClass("show") });
		// Maps.draw({ name: "level1b-V", el: window.find(".puzzle.p4").addClass("show") });

		let el = window.find(".puzzle.p1");
		// Maps.draw({ gen: "4x4", el });
		Maps.draw({ name: "simple-symmetry", el });
		// PGN
		// Maps.pgn(el);

		// let path = "0,3,N;0,2;1,2;1,1;3,1;3,0;4,0;4,1;5,1;5,2;3,2;3,3";
		// Snake.draw({ path, el: window.find(".puzzle.p1") });
		// Particles.setup({ path, el: window.find(".puzzle.p1") });

		// Maps.draw({ name: "exits", el: window.find(".puzzle.p2") });
		// Maps.draw({ gen: "4x3", el: window.find(".puzzle.p2") });

		// let ev = {
		// 	el: window.find(".puzzle span.entry:nth(1)"),
		// 	clientX: 267,
		// 	clientY: 525,
		// };
		// Snake.start(ev);

		// this.content.find(".puzzle span.entry:nth(0)").trigger("click");
		// Snake.getLimits([0,210]);
	},
	dispatch(event) {
		let Self = witney,
			value;
		switch (event.type) {
			// system events
			case "window.init":
				break;
			case "window.keyup":
				// reset all keys
				Input.keys.map(k => Input.key[k] = false);
				Input.dir = false;
				break;
			case "window.keystroke":
				value = event.char.toUpperCase();
				Input.dir = Input.keys.indexOf(value);
				Input.key[value] = true;
				if (Snake.pos) Snake.move({ dir: Input.dir });
				break;
			// custom events
			case "start-snake":
				Snake.dispatch(event);
				break;
			case "move-range":
				// Particles.update(event.value / 100);;
				break;
			case "output-pgn":
				value = Maps.pgn(event.origin.el);
				console.log(value);
				break;
			case "output-blank-pgn":
				value = Maps.generate(event.arg);
				console.log(value);
				break;
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;
		}
	}
};

window.exports = witney;
