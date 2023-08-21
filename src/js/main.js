
@import "modules/sample.js";
@import "modules/maps.js";


const windmill = {
	init() {
		// fast references
		this.content = window.find("content");

		Maps.draw({ name: "plus", el: window.find(".puzzle.p1") });
		Maps.draw({ name: "exits", el: window.find(".puzzle.p2") });
	},
	dispatch(event) {
		switch (event.type) {
			case "window.init":
				break;
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;
		}
	}
};

window.exports = windmill;
