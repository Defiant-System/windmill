
// witness.progression

{
	init() {
		// fast references
		this.els = {
			el: window.find(".progression"),
		};
		// keep track of active world / level
		this.active = {
			world: -1,
			level: -1,
		};
	},
	dispatch(event) {
		let APP = witness,
			Self = APP.progression,
			el;
		// console.log(event);
		switch (event.type) {
			// custom events
			case "apply-saved-state":
				// prevent lobby anim
				window.find(".start-view").addClass("no-anim");

				let data = [];
				// map out levels
				Game.level.list.map(entry => {
					let [w, i] = entry.split(".").map(i => +i);
					if (!data[w-1]) data[w-1] = [];
					data[w-1].push(i);
				});

				let xProgression = window.bluePrint.selectSingleNode(`//Data/Progression`),
					nodes = data.map((w, i) => {
						let total = Math.max(...w),
							solved = APP.state.progression[i],
							attr = [`state="locked"`];
						if (solved) attr = [`solved="${solved}"`];
						if ((Self.active.world < 0 && APP.state.progression[i+1] === undefined) || solved === 0) {
							if (attr.length === 1 && attr[0] === `state="locked"`) attr = [];
							attr.push(`state="active"`);
							attr.push(`percent="${Math.round((solved / total) * 100)}%"`);
							Self.active.world = i+1;
						}
						return `<World id="${i+1}" total="${total}" ${attr.join(" ")}/>`;
					});
				// console.log( `<data>${nodes.join("\n")}</data>` );

				// insert world nodes into bluePrint "Data"
				$.xmlFromString(`<data>${nodes.join("")}</data>`)
					.selectNodes("/data/World").map(xWorld => xProgression.appendChild(xWorld));

				// complete last active level string
				Self.active.level = APP.state.progression[Self.active.world-1];

				// render progression nav
				window.render({
					template: "game-progression",
					match: "//Data/Progression",
					target: window.find(".progression"),
				});
				// auto jump to "last" level
				Game.dispatch({ type: "render-level", arg: `${Self.active.world}.${Self.active.level}` });
				break;
			case "select-world":
				event.el.find(".expanded").removeClass("expanded");
				$(event.target).addClass("expanded");
				break;
			case "progress-power-up":
				// flash progression
				Self.els.el.find("li.expanded")
					.cssSequence("power-up", "animationend", el => {
						// reset element
						el.removeClass("power-up");

						let xWorld = window.bluePrint.selectSingleNode(`//Data/Progression/World[@id="${Self.active.world}"]`),
							total = +xWorld.getAttribute("total");
						if (Self.active.level < total) {
							Self.active.level++;
							// update progress bar
							let width = Math.round((Self.active.level / total) * 100) +"%";
							Self.els.el.find(`ul li.expanded .progress span`).css({ width })
						} else {
							Self.active.world++;
							Self.active.level = 0;
						}
					});
				break;
		}
	}
}
