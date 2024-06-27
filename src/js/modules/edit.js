
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
			xNode,
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
			case "create-clone":
				// remove old clones first
				window.bluePrint.selectNodes(`//Data/Level[@clone]`).map(xClone => xClone.parentNode.removeChild(xClone));
				// append new clone to bluePrint
				xNode = window.bluePrint.selectSingleNode(`//Data/Level[@id="${Game.grid.levelIndex}"]`);
				Self.levelClone = xNode.parentNode.appendChild(xNode.cloneNode(true));
				Self.levelClone.setAttribute("clone", Game.grid.levelIndex);
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

				// update palette selectbox
				Self.els.el.find(`selectbox[data-menu="grid-palette"]`).val(Self.els.level.data("palette"));

				// update symmetry selectbox
				value = Self.els.level.data("symmetry") || 1;
				Self.els.el.find(`selectbox[data-menu="grid-symmetry"]`).val(value);

				// create level clone
				Self.dispatch({ type: "create-clone" });
				// insert elements to facilitate editing
				Self.dispatch({ type: "add-edit-elements" });
				break;
			case "calculate-puzzle-layout":
				data = {};
				data.width = (UI.CELL_WIDTH * Game.grid.width) + UI.GRID_LINE;
				data.height = (UI.CELL_HEIGHT * Game.grid.height) + UI.GRID_LINE;
				data.top = (window.innerHeight - data.height) >> 1;
				data.left = (window.innerWidth - data.width) >> 1;
				Self.els.puzzle.css(data);
				break;
				
			case "add-edit-elements":
				// for cells
				value = [...Array(Game.grid.width * Game.grid.height)].map((c, i) => {
					let x = i % Game.grid.width,
						y = (i / Game.grid.width) | 0;
					return `<s class="edit-cell" style="--x: ${x}; --y: ${y};"></s>`;
				});
				Self.els.puzzle.find(".grid-base").append(value.join(""));

				// for grid lines
				Self.els.puzzle.find(".ns, .nsd, .we, .wed").map(elem => {
					let str = [
							`<s class="edit-head"></s>`,
							`<s class="edit-body"></s>`,
							`<s class="edit-foot"></s>`,
						];
					$(elem).append(str.join(""));
				});
				break;
				
			case "clear-edit-elements":
				Self.els.el.find("edit-cell, .edit-head, .edit-body, .edit-foot").remove();
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
				if (event.value > Game.grid.height) {
					data = [];
					[...Array(Game.grid.width)].map((c, i) => {
						data.push(`<i type="ns" x="${i}" y="${event.value-1}" />`);
						data.push(`<i type="we" x="${i}" y="${event.value}" />`);
					});
					data.push(`<i type="ns" x="${Game.grid.width}" y="${event.value-1}" />`);
					// get grid node
					xNode = Self.levelClone.selectSingleNode(`./grid`);
					// insert new nodes to levelClone
					$.xmlFromString(`<data>${data.join("")}</data>`).selectNodes("//data/i").map(x => xNode.appendChild(x));
					// add to grid dim
					Game.grid.height++;
					// update level node
					xNode.setAttribute("height", Game.grid.height);
					// render clone level
					Game.grid.renderClone(Self.levelClone);
				} else {
					// get grid node
					xNode = Self.levelClone.selectSingleNode(`./grid`);
					// remove nodes
					xNode.selectNodes(`./i[@y="${Game.grid.height}"]`).map(x => x.parentNode.removeChild(x));
					xNode.selectNodes(`./i[@type="ns"][@y="${Game.grid.height-1}"]`).map(x => x.parentNode.removeChild(x));
					xNode.selectNodes(`./i[@type="nsd"][@y="${Game.grid.height-1}"]`).map(x => x.parentNode.removeChild(x));
					// add to grid dim
					Game.grid.height--;
					// update level node
					xNode.setAttribute("height", Game.grid.height);
					// render clone level
					Game.grid.renderClone(Self.levelClone);
				}
				break;
			case "set-grid-cols":
				if (event.value > Game.grid.height) {
					data = [];
					[...Array(Game.grid.height)].map((c, i) => {
						data.push(`<i type="ns" x="${event.value}" y="${i}" />`);
						data.push(`<i type="we" x="${event.value-1}" y="${i}" />`);
					});
					data.push(`<i type="we" x="${event.value-1}" y="${Game.grid.height}" />`);
					// get grid node
					xNode = Self.levelClone.selectSingleNode(`./grid`);
					// insert new nodes to levelClone
					$.xmlFromString(`<data>${data.join("")}</data>`).selectNodes("//data/i").map(x => xNode.appendChild(x));
					// add to grid dim
					Game.grid.width++;
					// update level node
					xNode.setAttribute("width", Game.grid.width);
					// render clone level
					Game.grid.renderClone(Self.levelClone);
				} else {
					// get grid node
					xNode = Self.levelClone.selectSingleNode(`./grid`);
					// remove nodes
					xNode.selectNodes(`./i[@x="${Game.grid.width}"]`).map(x => x.parentNode.removeChild(x));
					xNode.selectNodes(`./i[@type="we"][@x="${Game.grid.width-1}"]`).map(x => x.parentNode.removeChild(x));
					xNode.selectNodes(`./i[@type="wed"][@x="${Game.grid.width-1}"]`).map(x => x.parentNode.removeChild(x));
					// add to grid dim
					Game.grid.width--;
					// update level node
					xNode.setAttribute("width", Game.grid.width);
					// render clone level
					Game.grid.renderClone(Self.levelClone);
				}
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
				// update UI
				Self.els.el.find(`selectbox[data-menu="grid-symmetry"]`).val(event.arg);
				break;
			case "set-palette":
				// update UI
				Self.els.el.find(`selectbox[data-menu="grid-palette"]`).val(event.arg);
				// transfer color values
				data = {};
				xNode = window.bluePrint.selectSingleNode(`//Palette[@id="${event.arg}"]`);
				xNode.selectNodes(`./c`).map(xColor => {
					let key = xColor.getAttribute("key");
					if (key) data[`--${key}`] = xColor.getAttribute("val");
				});
				// level update
				Self.els.level.css(data);
				// base bg color
				Self.els.level.parents("content").css({ "--base": data["--base"] });
				break;
			case "select-base-tool":
			case "select-extras-tool":
				el = $(event.target);
				// turn off tool
				if (el.hasClass("active_")) {
					// turn off tool
					el.removeClass("active_");
					return;
				}
				Self.els.el.find(`.option-buttons_ .active_`).removeClass("active_");
				// ui update
				el.addClass("active_");
				
				// clear old hovers
				value = ["cells", "lines", "starts", "end"].map(e => `hover-${e}`).join(" ");
				Game.grid.el.removeClass(value);
				
				// toggle hover areas
				value = el.data("hover").split(" ").map(e => `hover-${e}`).join(" ");
				Game.grid.el.addClass(value);

				if (Game.grid.el.hasClass("hover-ends")) {
					// edit-endpoints
				}
				break;

			case "set-extras-color":
				console.log(event);
				break;
		}
	}
}
