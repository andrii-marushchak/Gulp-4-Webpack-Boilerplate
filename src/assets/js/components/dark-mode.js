window.siteColorScheme = siteColorScheme = getColorScheme()

function getColorScheme() {
	if (localStorage.getItem('color-scheme'))
		return localStorage.getItem('color-scheme')
	else
		return window.matchMedia('(prefers-color-scheme: dark)').matches
			? 'dark'
			: 'light'
}

function setColorScheme(colorScheme = window.siteColorScheme) {
	localStorage.setItem('color-scheme', colorScheme)
	document.querySelector('html').setAttribute('data-color-scheme', colorScheme)
}

// Set Color Scheme on Load
document.addEventListener('DOMContentLoaded', function () {
	setColorScheme();

	// Enable transition for Color Scheme Toggle buttons
	document.documentElement.querySelectorAll('.color-scheme-toggle').forEach((btn) => {
		setTimeout(() => {
			btn.classList.remove('disable-transition')
		}, 200)
	})

})


// now this script can find and listen for clicks on the control
document.documentElement.querySelectorAll('.color-scheme-toggle').forEach((btn) => {
	btn.addEventListener('click', function () {

		// Flip Current Theme
		window.siteColorScheme = window.siteColorScheme === 'light' ? 'dark' : 'light'
		setColorScheme()

		btn.setAttribute('data-color-scheme', window.siteColorScheme)

		document.querySelector('html').classList.add('disable-transition')

		setTimeout(() => {
			document.querySelector('html').classList.remove('disable-transition')
		}, 200)

	})
})
