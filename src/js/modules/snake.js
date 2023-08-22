
let Snake = {
	start(event) {
		let puzzle = event.el.parents(".puzzle").addClass("started"),
			unit = parseInt(puzzle.cssProp("--unit"), 10),
			pW = puzzle.prop("offsetWidth"),
			pH = puzzle.prop("offsetHeight") + (unit * 2),
			sX = 7,
			sY = 21,
			sR = 19,
			snake = [];
		// snake nest
		snake.push(`<circle cx="${sX}" cy="${sY}" r="${sR}"/>`);
		// add snake to DOM
		puzzle.append(`<svg class="snake" viewBox="0 0 ${pW} ${pH}">${snake.join("")}</svg>`);

	},
	move(event) {

	},
	dispose(puzzle) {
		puzzle.find("svg.snake").remove();
	}
};
