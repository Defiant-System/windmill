
let Test = {
	init(APP) {
		// return;

		// Game.dispatch({ type: "render-level", arg: "1.7" });
		// Game.dispatch({ type: "render-level", arg: "1.1" });
		Game.dispatch({ type: "render-level", arg: "2.13" });
			// return;

		setTimeout(() => {
			APP.edit.dispatch({ type: "toggle-edit-view" });
			
			APP.edit.els.el.find(`.option-buttons_ span[data-arg="hexagon"]`).trigger("click");
			return;

			setTimeout(() => {
				window.find(`.we[style*="--x: 0;--y: 3;"]`).trigger("click");
				window.find(`.we[style="--x: 0;--y: 2;"]`).append(`<i class="hex middle"></i>`);
				window.find(`.we[style="--x: 1;--y: 2;"]`).append(`<i class="hex top"></i>`);
				window.find(`.ns[style="--x: 1;--y: 2;"]`).append(`<i class="hex middle"></i>`);
			}, 500);
			setTimeout(() => APP.edit.els.el.find(`.option-buttons_ span[data-arg="disjoint"]`).trigger("click"), 600);
		}, 500);

		// setTimeout(() => window.find(`.ns[data-junction="46"] .edit-head`).trigger("click"), 600);
		return;


		return setTimeout(() => {
			window.find(".puzzle svg").replace(`<svg width="102" height="185"><g transform="translate(9,9)"><g class="path1">
							<circle cx="0" cy="83" r="23.75"></circle>
							<line x1="0" y1="83" x2="0" y2="166" stroke-width="20" stroke-linecap="round"></line>
							<line x1="0" y1="166" x2="83" y2="166" stroke-width="20" stroke-linecap="round"></line>
							<line x1="83" y1="83" x2="83" y2="166" stroke-width="20" stroke-linecap="round"></line>
							<line x1="83" y1="83" x2="103" y2="83" stroke-width="20" stroke-linecap="round"></line>
						</g></g></svg>`);

			let el = window.find(".game-view .level .puzzle"),
				snake = { snakeEl: window.find("svg g.path1")[0] };
			Particles.start({ el, snake });
		}, 100);
	}
};

