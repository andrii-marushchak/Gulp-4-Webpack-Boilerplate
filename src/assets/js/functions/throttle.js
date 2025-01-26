/**
 * Throttle helper function
 *
 * Usage example:
 * const f = throttle(custom_function);
 * window.addEventListener('resize', f);
 *
 * @param  func
 * @param  delay
 *
 * @return {(function(...[*]): void)|*}
 */
export const throttle = (func, delay = 250) => {
	let isThrottled = false;
	let savedArgs = null;
	let savedThis = null;

	return function wrap(...args) {
		if (isThrottled) {
			(savedArgs = args), (savedThis = this);
			return;
		}

		func.apply(this, args);
		isThrottled = true;

		setTimeout(() => {
			isThrottled = false;

			if (savedThis) {
				wrap.apply(savedThis, savedArgs);
				savedThis = null;
				savedArgs = null;
			}
		}, delay);
	};
};
