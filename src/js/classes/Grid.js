
class Grid {
	constructor(index) {
		this.levelIndex = index;
		this.level = Level[index];
	}

	render(id) {
		// save value
		this.levelIndex = id;
		
		// html output
		let match = `//Data/Level[@id="${this.levelIndex}"]`;
		window.render({
			match,
			template: "level-puzzle",
			target: window.find(".game-view"),
		});
		
		// update window title
		window.title = `Witness - Level ${this.levelIndex}`;

		// center puzzle
		this.el = window.find(".game-view .level .puzzle");
		let top = (window.innerHeight - +this.el.prop("offsetHeight")) >> 1,
			left = (window.innerWidth - +this.el.prop("offsetWidth")) >> 1;
		this.el.css({ top, left });

		let base = window.bluePrint.selectSingleNode(`${match}/Palette/c[@key="base"]`);
		window.find("content").css({ "--base": base.getAttribute("val") });
	}
}