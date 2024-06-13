
class Grid {
	constructor(index) {
		this.levelIndex = index;
		this.level = Level[index];
	}

	render() {
		window.render({
			template: "level-puzzle",
			match: `//Data/Level[@id="1.1"]`,
			target: window.find(".game-view"),
		});
	}
}
