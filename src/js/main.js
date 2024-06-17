

@import "modules/bg.js";
@import "modules/game.js";
@import "modules/particles.js";
@import "modules/validation.js";
@import "modules/keys.js";
@import "modules/misc.js";
@import "modules/test.js";

@import "classes/Point.js";
@import "classes/Vector.js";
@import "classes/Firefly.js";
@import "classes/ElapsedTime.js";
@import "classes/Orientation.js";
@import "classes/NavigationSelector.js";
@import "classes/GroupingDisjointSet.js";
@import "classes/Grouping.js";
@import "classes/Symmetry.js";
@import "classes/Path.js";
@import "classes/Grid.js";
@import "classes/Snake.js";


const witness = {
	init() {
		// init objects
		Bg.init();
		Game.init();
		Particles.init();

		Game.grid.render("lobby");
		// Game.grid.render("2.3");
		// Game.grid.render("1.0");

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
			case "window.focus":
				// resume background worker
				Bg.dispatch({ type: "resume" });
				break;
			case "window.blur":
				// resume background worker
				Bg.dispatch({ type: "pause" });
				break;
			// custom events
			case "show-view":
				window.find("content").data({ show: event.arg });
				break;
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
