
// witness.progression

{
	init() {
		// fast references
		this.els = {
			el: window.find(".progression"),
		};
	},
	dispatch(event) {
		let APP = witness,
			Self = APP.progression,
			xNode,
			data,
			value,
			el;
		// console.log(event);
		switch (event.type) {
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
				Game.dispatch({ type: "render-level", arg: "1.0" });
				break;
			case "select-world":
				event.el.find(".expanded").removeClass("expanded");
				$(event.target).addClass("expanded");
				break;
			case "progress-power-up":
				// flash progression
				Self.els.el.find("li.expanded")
					.cssSequence("power-up", "animationend", el => el.removeClass("power-up"));
				break;
		}
	}
}
