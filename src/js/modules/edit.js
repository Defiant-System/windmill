
// witness.edit

{
	init() {
		// fast references
		this.els = {
			el: window.find(".edit-view"),
		};
	},
	dispatch(event) {
		let APP = witness,
			Self = APP.edit,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			// custom events
			case "close-view":
			case "toggle-edit-view":
				value = Self.els.el.hasClass("show");
				Self.els.el.toggleClass("show", value);
				break;
			case "output-xml":
				break;
		}
	}
}
