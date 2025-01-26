/**
 * Debounce helper function
 *
 * Usage example:
 * const f = debounce(custom_function);
 * window.addEventListener('resize', f);
 *
 * @param  func
 * @param  delay
 *
 * @return {(function(...[*]): void)|*}
 */
export const debounce = (func, delay = 250) => {
	let timeoutId = null;

	return function wrap(...args) {
		// Clear the previous timeout if the function is called again before the delay
		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		// Set a new timeout to execute the function after the delay
		timeoutId = setTimeout(() => {
			func.apply(this, args);
		}, delay);
	};
};
