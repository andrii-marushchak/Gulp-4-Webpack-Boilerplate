import getScrollbarWidth from "get-scrollbar-width"

const setScrollbarWidthCSSVariable = () => {
    if (document.querySelector('body').offsetHeight > document.documentElement.clientHeight) {
        document.documentElement.style.setProperty('--scroll-width', getScrollbarWidth() + 'px')
    } else {
        document.documentElement.style.setProperty('--scroll-width', 0 + 'px')
    }
}

// Update Browser Windows Sizes
['resize', 'orientationchange', 'popstate', 'hashchange', 'load'].forEach(event => {
    window.addEventListener(event, () => {
        setScrollbarWidthCSSVariable()
    });
});

setScrollbarWidthCSSVariable()
