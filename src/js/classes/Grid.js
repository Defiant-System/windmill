
class Grid {
	constructor(index) {
		this.levelIndex = index;
		this.level = Level[index];
	}

	render(id) {
		// save value
		this.levelIndex = id;
		// html output
		window.render({
			template: "level-puzzle",
			match: `//Data/Level[@id="${this.levelIndex}"]`,
			target: window.find(".game-view"),
		});
	}
}
