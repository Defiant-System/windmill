

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

		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init(this));

		// reference to progression node
		this.xProgression = window.bluePrint.selectSingleNode(`//Data/Progression`);
		// get saved progression, if any
		let progression = window.settings.getItem("progression");
		if (progression) {
			// replace saved progression with default in "Data"
			this.xProgression.parentNode.replaceChild(progression, this.xProgression);
		}

		if (this.xProgression.selectNodes("./*").length) {
			// go to last saved state
			this.dispatch({ type: "apply-saved-state" });
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
			case "window.focus":
				// resume background worker
				Bg.dispatch({ type: "resume" });
				break;
			case "window.blur":
				// resume background worker
				Bg.dispatch({ type: "pause" });
				break;
			// custom events
			case "apply-saved-state":
				// prevent lobby anim
				window.find(".start-view").addClass("no-anim");
				// map out levels
				Game.level.list.map(entry => {
					let [w, i] = entry.split(".").map(i => +i);
				});
				// render progression nav
				window.render({
					template: "game-progression",
					match: "//Data/Progression",
					target: window.find(".progression"),
				});
				// auto jump to "last" level
				Game.dispatch({ type: "render-level", arg: "2.10" });
				break;
			case "show-view":
				window.find("content").data({ show: event.arg });
				break;
			case "render-level":
				Game.dispatch(event);
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
