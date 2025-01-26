/**
 * Get the value of a specific GET parameter from the URL.
 *
 * Usage example:
 * const value = getGETParam('paramName');
 *
 * @param {string} param - The name of the GET parameter to retrieve.
 * @return {string|null} - The value of the GET parameter, or null if not found.
 */
function getGETParam(param) {
	return new URLSearchParams(window.location.search).get(param);
}

/**
 * Set or update a GET parameter in the URL with a specified value.
 *
 * Usage example:
 * setGETParam('paramName', 'value');
 *
 * @param {string} param - The name of the GET parameter to set.
 * @param {string} value - The value to set for the GET parameter.
 * @return {void}
 */
function setGETParam(param, value) {
	let url = new URLSearchParams(window.location.search);
	url.set(param, value);
	let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + url;
	window.history.replaceState({}, document.title, newurl);
}

/**
 * Remove a specific GET parameter from the URL.
 *
 * Usage example:
 * removeGetParam('paramName');
 *
 * @param {string} param - The name of the GET parameter to remove.
 * @return {void}
 */
function removeGetParam(param) {
	let url = new URLSearchParams(window.location.search);
	url.delete(param);
	url = url.toString().length > 0 ? '?' + url : url;
	let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + url;
	window.history.replaceState({}, document.title, newurl);
}

export { getGETParam, setGETParam, removeGetParam }
