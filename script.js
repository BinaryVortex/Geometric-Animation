
window.addEventListener("DOMContentLoaded",() => {
	const c = new Clock23(".clock");
});

class Clock23 {
	fullClass = "full";

	constructor(el) {
		this.el = document.querySelector(el);

		this.init();
	}
	init() {
		this.timeUpdate();
	}
	get timeAsObject() {
		const date = new Date();
		const h = date.getHours();
		const m = date.getMinutes();
		const s = date.getSeconds();

		return { h, m, s };
	}
	get timeAsString() {
		const [h,m,s,ap] = this.timeDigitsGrouped;

		return `${h}:${m}:${s} ${ap}`;
	}
	get timeDigitsGrouped() {
		// this accessible string uses the 12-hour clock
		let { h, m, s } = this.timeAsObject;
		const ap = h > 11 ? "PM" : "AM";
		// deal with midnight
		if (h === 0) h += 12;
		else if (h > 12) h -= 12;
		// prepend 0 to the minute and second if single digits
		if (m < 10) m = `0${m}`;
		if (s < 10) s = `0${s}`;

		return [h,m,s,ap];
	}
	checkFills(hands) {
		for (let hand of hands) {
			const unit = this.el?.querySelector(`[data-unit="${hand.name}"]`);

			if (hand.fraction === 0)
				unit?.classList.add(this.fullClass);
		}
	}
	clearFills() {
		const fills = Array.from(this.el?.querySelectorAll("[data-unit]"));

		for (let fill of fills)
			fill.classList.remove(this.fullClass);
	}
	timeUpdate() {
		// update the accessible timestamp in the `aria-label`
		this.el?.setAttribute("aria-label", this.timeAsString);
		// move the hands
		const time = this.timeAsObject;
		const minFraction = time.s / 60;
		const hrFraction = (time.m + minFraction) / 60;
		const twelveHrFraction = (time.h % 12 + hrFraction) / 12;
		const hands = [
			{ name: "h", fraction: twelveHrFraction, value: 376.99 },
			{ name: "m", fraction: hrFraction, value: 578.05 },
			{ name: "s", fraction: minFraction, value: 779.11 }
		];
		const activeClass = "active";

		for (let hand of hands) {
			this.el?.style.setProperty(
				`--${hand.name}Offset`,
				Utils.decPlaces(hand.value * (1 - hand.fraction),3)
			);

			const unit = this.el?.querySelector(`[data-unit="${hand.name}"]`);
			const ticks = Array.from(unit?.querySelectorAll("[data-value]"));

			for (let tick of ticks) {
				const dataValue = +tick.getAttribute("data-value");
				let timeValue = time[hand.name];

				if (hand.name === "h")
					timeValue %= 12;

				if (dataValue <= timeValue)
					tick.classList.add(activeClass);
				else
					tick.removeAttribute("class");
			}
		}
		this.checkFills(hands);

		// loop
		clearTimeout(this.clearFillsLoop);
		this.clearFillsLoop = setTimeout(this.clearFills.bind(this),600);
		clearTimeout(this.timeUpdateLoop);
		this.timeUpdateLoop = setTimeout(this.timeUpdate.bind(this),1e3);
	}
}
class Utils {
	static decPlaces(n,d) {
		return Math.round(n * 10 ** d) / 10 ** d;
	}
}