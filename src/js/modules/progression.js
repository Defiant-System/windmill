
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
			case "select-world":
				event.el.find(".expanded").removeClass("expanded");
				$(event.target).addClass("expanded");
				break;
		}
	}
}
