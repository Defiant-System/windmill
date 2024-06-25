
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
			iCellWidth: window.find(`input[data-change="set-cell-width"]`),
			iCellHeight: window.find(`input[data-change="set-cell-height"]`),
		};

		// subscribe to events
		window.on("render-level", this.dispatch);
	},
	dispatch(event) {
		let APP = witness,
			Self = APP.edit,
			data,
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
				// save reference to level root element
				Self.els.level = Game.grid.el.parent();
				Self.els.puzzle = Self.els.level.find("> .puzzle")

				Self.els.iGridRows.val(Game.grid.width);
				Self.els.iGridCols.val(Game.grid.height);
				
				Self.els.iLine.val( parseInt(Self.els.level.cssProp("--line")) );
				Self.els.iGap.val( parseInt(Self.els.level.cssProp("--gap")) );
				Self.els.iCellWidth.val( parseInt(Self.els.level.cssProp("--gW")) );
				Self.els.iCellHeight.val( parseInt(Self.els.level.cssProp("--gH")) );
				break;
			case "calculate-puzzle-layout":
				data = {};
				data.width = (UI.CELL_WIDTH * Game.grid.width) + UI.GRID_LINE;
				data.height = (UI.CELL_HEIGHT * Game.grid.height) + UI.GRID_LINE;
				data.top = (window.innerHeight - data.height) >> 1;
				data.left = (window.innerWidth - data.width) >> 1;
				Self.els.puzzle.css(data);
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
				value = +event.el.parents(".row:first").find("input").val();
				Self.els.iCellHeight.val(value);
				Self.dispatch({ type: "set-cell-height", value });
				break;
			case "sync-cell-height":
				value = +event.el.parents(".row:first").find("input").val();
				Self.els.iCellWidth.val(value);
				Self.dispatch({ type: "set-cell-width", value });
				break;
			case "set-grid-rows":
			case "set-grid-cols":
				console.log(event);
				break;
			case "set-cell-width":
				Self.els.level.css({ "--gW": `${event.value}px` });
				// update "constants"
				UI.CELL_WIDTH = event.value;
				// update UI
				Self.dispatch({ type: "calculate-puzzle-layout" });
				break;
			case "set-cell-height":
				Self.els.level.css({ "--gH": `${event.value}px` });
				// update "constants"
				UI.CELL_HEIGHT = event.value;
				// update UI
				Self.dispatch({ type: "calculate-puzzle-layout" });
				break;
			case "set-grid-gap":
				Self.els.level.css({ "--gap": `${event.value}px` });
				// update "constants"
				UI.DISJOINT_LENGTH = event.value;
				break;
			case "set-grid-line":
				Self.els.level.css({ "--line": `${event.value}px` });
				// update "constants"
				UI.GRID_LINE = event.value;
				// update UI
				Self.dispatch({ type: "calculate-puzzle-layout" });
				break;
			case "set-symmetry":
			case "set-palette":
			case "set-extras-color":
				console.log(event);
				break;
		}
	}
}
