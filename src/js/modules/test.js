
let Test = {
	init(APP) {
		// return;

		Game.dispatch({ type: "render-level", arg: "1.01" });
		return;

		return setTimeout(() => {
			let data = $.xmlFromString(`<data>
								<i type="dot" x="0" y="0"/>
								<i type="dot" x="0" y="1"/>
								
								<i type="hex" x="0" y="0" line="ns" hc="1"/>
								<i type="hex" x="0" y="1" line="we" hc="1" hm="1"/>
								<i type="hex" x="1" y="1" line="ns" hm="1"/>

								<i type="hex" x="1" y="1" line="ns" hc="1" hm="1"/>
							</data>`);
			// console.log( data );
			window.render({
				data,
				template: "puzzle-errors",
				target: window.find(".grid-error"),
			});

		}, 800);


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

