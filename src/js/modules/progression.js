
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
				console.log(event);
				break;
		}
	}
}
