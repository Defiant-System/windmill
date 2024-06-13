
let Game = {
	init() {
		// fast references
		this.doc = $(document);
		this.grid = new Grid();
	},
	dispatch(event) {
		let Self = Game,
			value;
		switch (event.type) {
			case "click":
			case "init-snake":
				// start cicle was clicked
				if (Self._locked) {
					// release mouse lock
					document.exitPointerLock();
					delete Self._locked;
					
					// unbind event handlers
					Self.doc.off("click", Self.dispatch);
					Self.doc.off("mousemove", Self.dispatch);
				} else {
					Self.grid.el[0].requestPointerLock();
					Self._locked = true;

					// bind event handlers
					Self.doc.on("click", Self.dispatch);
					Self.doc.on("mousemove", Self.dispatch);
				}
				break;
			case "mousemove":
				break;
		}
	}
};
