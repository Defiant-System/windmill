

@import "classes/Grid.js";

@import "levels/index.js";
@import "modules/game.js";
@import "modules/misc.js";
@import "modules/test.js";


const witness = {
	init() {
		// init objects
		Game.init();

		Game.grid.render("2.0");

		// DEV-ONLY-START
		Test.init(this);
		// DEV-ONLY-END
	},
	dispatch(event) {
		let Self = witness,
			value;
		switch (event.type) {
			// system events
			case "window.init":
				break;
			// custom events
			case "render-level":
				Game.grid.render(event.arg);
				break;
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;
		}
	}
};

window.exports = witness;
