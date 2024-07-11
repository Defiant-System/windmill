
class TetrisValidationAttempt {
	constructor(positive, negative, positiveCount, negativeCount, opt_excluded) {
		this.positive = positive;
		this.negative = negative;
		this.positiveCount = positiveCount;
		this.negativeCount = negativeCount;
		this.excluded = opt_excluded || [];
	}
}
