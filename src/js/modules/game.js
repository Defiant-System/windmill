
let Game = {
	init() {
		// fast references
		this.doc = $(document);
		this.grid = new Grid();

		this.level = {
				index: 0,
				list: window.bluePrint.selectNodes(`//Data/Level[not(@type)]`).map(x => +x.getAttribute("id")).sort((a,b) => a - b),
			};
		// console.log( this.level.list )
	},
	dispatch(event) {
		let Self = Game,
			data,
			el;
		switch (event.type) {
			// native events
			case "click":
			case "init-snake":
				// start cicle was clicked
				if (Self._locked) {
					// release mouse lock
					document.exitPointerLock();
					delete Self._locked;

					// end state of snake
					Game.grid.finishSnake();

					// unbind event handlers
					Self.doc.off("click", Self.dispatch);
					Self.doc.off("mousemove", Self.dispatch);
				} else {
					Self.grid.el[0].requestPointerLock();
					Self._locked = true;

					// bind event handlers
					Self.doc.on("click", Self.dispatch);
					Self.doc.on("mousemove", Self.dispatch);

					el = $(event.target);
					data = {
						x: +el.cssProp("--x"),
						y: +el.cssProp("--y"),
						mX: event.clientX,
						mY: event.clientY,
					};
					Game.grid.initializeSnake(data);
				}
				break;
			case "mousemove":
				if (!Game.grid.snake.targetingMouse && event.movementX != undefined) {
					Game.grid.snake.setMouseDiff(event.movementX, event.movementY);
					Game.grid.updateSnake();
				} else {
					Game.grid.snake.targetingMouse = false;
				}
				break;
			// custom events
			case "render-level":
				Self.grid.render(event.arg);
				break;
			case "goto-next-level":
				
				break;
		}
	}
};
