
class ElapsedTime {
	constructor() {
		this.lastUpdateTime = null;
		this.lastStep = null;
	}

	step() {
		let currentTime = new Date();
		let previousTime = this.lastUpdateTime;
		this.lastUpdateTime = currentTime;
		if (previousTime === null) return null;
		
		this.lastStep = currentTime - previousTime;
		return this.lastStep;
	}
}
