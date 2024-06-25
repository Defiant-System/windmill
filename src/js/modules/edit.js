
// witness.edit

{
	init() {
		// fast references
		this.els = {
			el: window.find(".edit-view"),
			iGridRows: window.find(`input[data-change="set-grid-rows"]`),
			iGridCols: window.find(`input[data-change="set-grid-cols"]`),
			iLine: window.find(`input[data-change="set-grid-line"]`),
			iGap: window.find(`input[data-change="set-grid-gap"]`),
			iCellHeight: window.find(`input[data-change="set-cell-width"]`),
			iCellWidth: window.find(`input[data-change="set-cell-height"]`),
		};

		// subscribe to events
		window.on("render-level", this.dispatch);
	},
	dispatch(event) {
		let APP = witness,
			Self = APP.edit,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			// subscribed events
			case "render-level":
				if (Self.els.el.hasClass("show")) {
					Self.dispatch({ type: "init-edit-view" });
				}
				break;
			// custom events
			case "close-view":
			case "toggle-edit-view":
				value = Self.els.el.hasClass("show");
				Self.els.el.toggleClass("show", value);

				if (!value) Self.dispatch({ type: "init-edit-view" });
				break;
			case "output-xml":
				break;
			case "init-edit-view":
				el = Game.grid.el.parent();

				Self.els.iGridRows.val(Game.grid.width);
				Self.els.iGridCols.val(Game.grid.height);
				
				Self.els.iLine.val( parseInt(el.cssProp("--line")) );
				Self.els.iGap.val( parseInt(el.cssProp("--gap")) );
				Self.els.iCellWidth.val( parseInt(el.cssProp("--gW")) );
				Self.els.iCellHeight.val( parseInt(el.cssProp("--gH")) );
				break;
			case "select-base-tool":
				el = $(event.target);
				if (el.hasClass("active_")) return;
				// ui update
				Self.els.el.find(`.option-buttons_[data-click="select-base-tool"] .active_`).removeClass("active_");
				el.addClass("active_");
				break;
			case "select-extras-tool":
				el = $(event.target);
				if (el.hasClass("active_")) return;
				// ui update
				Self.els.el.find(`.option-buttons_[data-click="select-extras-tool"] .active_`).removeClass("active_");
				el.addClass("active_");
				break;
			case "sync-cell-width":
			case "sync-cell-height":
			case "set-grid-rows":
			case "set-grid-cols":
			case "set-grid-line":
			case "set-grid-gap":
			case "set-cell-width":
			case "set-cell-height":
				break;
			case "set-symmetry":
			case "set-palette":
			case "set-extras-color":
				console.log(event);
				break;
		}
	}
}
