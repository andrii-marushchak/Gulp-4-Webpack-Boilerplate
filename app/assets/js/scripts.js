import getScrollbarWidth from "get-scrollbar-width";
import $ from 'jquery'

global.jQuery = $
global.$ = $

// Set dynamic 100vh / 100 css variable
function setVhCSSVariable() {
    let vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
}

// Set scrollbar width css variable
function setScrollbarWidthCSSVariable() {
    if (document.documentElement.clientHeight < document.querySelector('body').clientHeight) {
        document.documentElement.style.setProperty('--scroll-width', getScrollbarWidth() + 'px');
    } else {
        document.documentElement.style.setProperty('--scroll-width', '0px');
    }
}

// Update Browser Windows Sizes
["resize", "orientationchange", "popstate", "hashchange"].forEach(event => {
    window.addEventListener(event, () => {
        setVhCSSVariable()
        setScrollbarWidthCSSVariable()
    });
});

// Init Variables first time
setVhCSSVariable()
setScrollbarWidthCSSVariable();

jQuery(document).ready(function ($) {
    "use strict"


});

document.addEventListener("DOMContentLoaded", function (event) {
    "use strict";


});


/* Example of async import

async function loadMyModule() {
  const myModule = await import('./myModule.js');
  // ... use myModule
}

loadMyModule();

import("choices.js").then((Choices) => {

});

import("gsap").then(({default: gsap}) => {

});

*/

