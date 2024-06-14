

@import "levels/index.js";
@import "modules/bg.js";
@import "modules/game.js";
@import "modules/misc.js";
@import "modules/test.js";

@import "classes/ElapsedTime.js";
@import "classes/NavigationSelector.js";
@import "classes/Grid.js";
@import "classes/Snake.js";


const witness = {
	init() {
		// init objects
		Bg.init();
		Game.init();

		Game.grid.render("2.2");

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
			default:
				// proxy to game
				Game.dispatch(event);
		}
	}
};

window.exports = witness;
