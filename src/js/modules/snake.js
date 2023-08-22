
let Snake = {
	init() {
		this.APP = witney;
		this.content = witney.content;
		this.doc = $(document);
	},
	start(event) {
		let puzzle = event.el.parents(".puzzle").addClass("started"),
			unit = parseInt(puzzle.cssProp("--unit"), 10),
			pW = puzzle.prop("offsetWidth"),
			pH = puzzle.prop("offsetHeight") + (unit * 2),
			sX = +event.el.prop("offsetLeft") + 7,
			sY = +event.el.prop("offsetTop") + 21,
			sR = unit + 5,
			snake = [];
		// snake nest
		snake.push(`<circle cx="${sX}" cy="${sY}" r="${sR}"/>`);

		snake.push(`<line x1="${sX}" y1="${sY}" x2="${sX+50}" y2="${sY}"/>`);
		
		snake.push(`<circle class="head" cx="${sX+50}" cy="${sY}" r="${unit * .5}"/>`);

		// add snake to DOM
		puzzle.append(`<svg class="snake" viewBox="0 0 ${pW} ${pH}">${snake.join("")}</svg>`);
		// save refernce to puzzle
		this.puzzle = puzzle;
		// cover app content
		this.content.addClass("cover");
		// bind event handler
		this.doc.bind("click mousemove", this.move);
	},
	move(event) {
		let Self = Snake,
			APP = Self.APP;
		switch (event.type) {
			case "click":
				// dispose snake & reset puzzle
				Self.puzzle.find("svg.snake").remove();
				Self.puzzle.removeClass("started");
				// reset app content
				Self.content.removeClass("cover");
				// bind event handler
				Self.doc.unbind("click mousemove", Self.move);
				break;
			case "mousemove":
				break;
		}
	}
};
