
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
			data,
			el;
		// console.log(event);
		switch (event.type) {
			// custom events
			case "apply-saved-state":
				// prevent lobby anim
				window.find(".start-view").addClass("no-anim");

				data = [];
				// map out levels
				Game.level.list.map(entry => {
					let [w, i] = entry.split(".").map(i => +i);
					if (!data[w-1]) data[w-1] = [];
					data[w-1].push(i);
				});

				let active = { world: -1 },
					xProgression = window.bluePrint.selectSingleNode(`//Data/Progression`),
					nodes = data.map((w, i) => {
						let solved = APP.state.progression[i],
							attr = [`state="locked"`];
						if (solved) attr = [`solved="${solved}"`];
						if ((active.world < 0 && APP.state.progression[i+1] === undefined) || solved === 0) {
							if (attr.length === 1 && attr[0] === `state="locked"`) attr = [];
							attr.push(`state="active"`);
							active.world = i+1;
						}
						return `<World id="${i+1}" total="${Math.max(...w)}" ${attr.join(" ")}/>`;
					});
				// console.log( `<data>${nodes.join("\n")}</data>` );

				// insert world nodes into bluePrint "Data"
				$.xmlFromString(`<data>${nodes.join("")}</data>`)
					.selectNodes("/data/World").map(xWorld => xProgression.appendChild(xWorld));

				// complete last active level string
				active.level = APP.state.progression[active.world-1];

				// render progression nav
				window.render({
					template: "game-progression",
					match: "//Data/Progression",
					target: window.find(".progression"),
				});
				// auto jump to "last" level
				Game.dispatch({ type: "render-level", arg: `${active.world}.${active.level}` });
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
