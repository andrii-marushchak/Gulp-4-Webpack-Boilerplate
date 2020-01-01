jQuery(document).ready(function ($) {
    "use strict";

    const IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
        Android = navigator.userAgent.toLowerCase().indexOf("android") > -1,
        Firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
        Edge = navigator.userAgent.toLowerCase().indexOf('edge') > -1;

    const browser = {
        w: document.documentElement.clientWidth,
        h: document.documentElement.clientHeight,
    };
    $(window).on('resize orientationchange', () => {
        browser.w = document.documentElement.clientWidth;
        browser.h = document.documentElement.clientHeight;
    });

});
