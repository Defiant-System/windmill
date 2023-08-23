
@import "modules/sample.js";
@import "modules/maps.js";
@import "modules/snake.js";


const witney = {
	init() {
		// fast references
		this.content = window.find("content");
		// init sub objects
		Snake.init();

		Maps.draw({ name: "large", el: window.find(".puzzle.p1") });
		// Maps.draw({ name: "level1-H", el: window.find(".puzzle.p2") });
		// Maps.draw({ name: "exits", el: window.find(".puzzle.p2") });
		// Maps.draw({ gen: "4x3", el: window.find(".puzzle.p2") });

		// Maps.draw({ name: "plus", el: window.find(".puzzle.p1") });
		// let snake = [];
		// snake.push(`<circle class="nest" cx="77" cy="217" r="19"/>`);
		// snake.push(`<line x1="77" y1="218" x2="77" y2="7"/>`);
		// snake.push(`<line class="neck" x1="77" y1="7" x2="113" y2="7"/>`);

		// window.find(".puzzle.p1")
		// 	.addClass("started")
		// 	.append(`<svg class="snake" viewBox="0 0 224 224">${snake.join("")}</svg>`);
	},
	dispatch(event) {
		switch (event.type) {
			// system events
			case "window.init":
				break;
			// custom events
			case "start-snake":
				Snake.start(event);
				break;
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;
		}
	}
};

window.exports = witney;
