

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


const DefaultState = {
	// progression: [13, 37, 30, 26, 12, 21],
	// progression: [13, 1],
	// progression: [],
};


const witness = {
	init() {
		// init objects
		Bg.init();
		Game.init();
		Particles.init();

		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init(this));

		// get saved progression, if any
		this.state = window.settings.getItem("progression") || DefaultState;

		if (this.state.progression.length) {
			// go to last saved state
			this.progression.dispatch({ type: "apply-saved-state" });
		} else {
			// start view / first "level"
			Game.dispatch({ type: "render-level", arg: "0.1" });
		}

		// DEV-ONLY-START
		Test.init(this);
		// DEV-ONLY-END
	},
	dispatch(event) {
		let Self = witness,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "window.init":
				break;
			case "window.close":
				// save game state
				value = Self.progression.dispatch({ type: "serialize-progress" });
				window.settings.setItem("progression", { progression: value });
				break;
			case "window.focus":
				// resume background worker
				Bg.dispatch({ type: "resume" });
				break;
			case "window.blur":
				// resume background worker
				Bg.dispatch({ type: "pause" });
				break;
			// from menu
			case "render-level":
				Game.dispatch(event);
				break;
			// custom events
			case "show-view":
				window.find("content").data({ show: event.arg });
				break;
			case "blank-template":
			case "toggle-edit-view":
				return Self.edit.dispatch(event);
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;
			default:
				el = event.el;
				if (!el && event.origin) el = event.origin.el;
				if (el) {
					let pEl = el.parents(`?div[data-area]`);
					if (pEl.length) {
						let name = pEl.data("area");
						return Self[name].dispatch(event);
					}
				}
				// proxy to game
				Game.dispatch(event);
		}
	},
	edit: @import "./modules/edit.js",
	progression: @import "./modules/progression.js",
};

window.exports = witness;
