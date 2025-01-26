/**
 * Helper function to set a cookie with a specified name, value, and expiration time in days.
 *
 * Usage example:
 * setCookie('user', { name: 'John Doe', age: 30 }, 7);
 *
 * @param {string} name - The name of the cookie.
 * @param {*} value - The value to store in the cookie (will be stringified).
 * @param {number} days - The number of days until the cookie expires.
 * @return {void}
 */
function setCookie(name, value, days) {
	const date = new Date();
	date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Convert days to milliseconds
	const expires = `; expires=${date.toUTCString()}`;
	document.cookie = `${name}=${JSON.stringify(value)}${expires}; path=/`;
}

/**
 * Helper function to get a cookie value by its name.
 *
 * Usage example:
 * const user = getCookie('user');
 *
 * @param {string} name - The name of the cookie to retrieve.
 * @return {*} - The value of the cookie (parsed from JSON), or null if the cookie doesn't exist.
 */
function getCookie(name) {
	const nameEQ = `${name}=`;
	const ca = document.cookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) === ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) === 0) {
			return JSON.parse(c.substring(nameEQ.length, c.length));
		}
	}
	return null;
}

export { setCookie, getCookie };
