
class GroupingDisjointSet {

	static seeds = {};

	constructor(coord, allCoords) {
		this.data = new Grouping(coord);
		this.allCoords = allCoords;
		this.visited = false;
	}

	getSeed() {
		var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		var key = Keys.coordKey(this.data.seed);
		if (!(key in GroupingDisjointSet.seeds)) {
			// var size = goog.object.getCount(GroupingDisjointSet.seeds);
			var size = Object.keys(GroupingDisjointSet.seeds).length;
			GroupingDisjointSet.seeds[key] = alphabet[size];
		}
		return GroupingDisjointSet.seeds[key];
	}

	union(repr) {
		if (this.data == repr.data || repr.data.count == 0) {
			return;
		}
		var otherData = repr.data;
		// otherData.coords.forEach(function(otherCoord, key) {
		Object.keys(otherData.coords).map(key => {
			let otherCoord = otherData.coords[key];
			// This is not the most efficient, but this is optimizing for simplicity.
			var other = this.allCoords[key];
			this.data.count += 1;
			other.data.count -= 1;
			this.data.coords[key] = otherCoord;
			//delete other.data.coords[key];
			other.data = this.data;
		}, this);
		if (otherData.count > 0) {
			throw Error();
		}
	}
}
