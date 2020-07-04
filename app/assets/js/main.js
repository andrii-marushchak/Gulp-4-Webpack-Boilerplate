jQuery(document).ready(function ($) {
    "use strict";

    // Platform Detection
    const IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
        Android = navigator.userAgent.toLowerCase().indexOf("android") > -1,
        Firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
        Edge = navigator.userAgent.toLowerCase().indexOf('edge') > -1,
        IE = navigator.userAgent.toLowerCase().indexOf('msie ') > -1;

    // Browser Windows Sizes
    const browser = {
        w: document.documentElement.clientWidth,
        h: document.documentElement.clientHeight,
    };

    
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    $(window).on('resize orientationchange', () => {
        browser.w = document.documentElement.clientWidth;
        browser.h = document.documentElement.clientHeight;

        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    });

    /* ----------------------------------- Scrollbar CSS Variable ------------------------------------ */
    {
        const getScrollbarWidth = () => {
            let outer = document.createElement("div");
            outer.style.visibility = "hidden";
            outer.style.width = "100px";
            outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

            document.body.appendChild(outer);

            let widthNoScroll = outer.offsetWidth;
            // force scrollbars
            outer.style.overflow = "scroll";

            // add innerdiv
            let inner = document.createElement("div");
            inner.style.width = "100%";
            outer.appendChild(inner);

            let widthWithScroll = inner.offsetWidth;

            // remove divs
            outer.parentNode.removeChild(outer);

            return widthNoScroll - widthWithScroll;
        }

        if ($('body').outerHeight() <= document.documentElement.clientHeight) {
            document.documentElement.style.setProperty('--scroll-width', 0);
        } else {
            if ($('html').hasClass('cssscrollbar') && !(Android || IOS || document.documentElement.clientWidth <= 991)) {
                document.documentElement.style.setProperty('--scroll-width', getComputedStyle(document.documentElement).getPropertyValue('--scrollbar-width'));
            } else {
                document.documentElement.style.setProperty('--scroll-width', getScrollbarWidth() + 'px');
            }
        }
    }


});
