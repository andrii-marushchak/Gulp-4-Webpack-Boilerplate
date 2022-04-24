const links = document.querySelectorAll('a[href^="#"]:not(.modal-toggle)')

links.forEach((nodeElement) => {
    nodeElement.addEventListener('click', function (e) {
        e.preventDefault()

        const href = this.getAttribute('href')

        if (href === '#') {
            return false;
        } else {
            const section = document.querySelector(href)
            if (section) {

                let offset = section.getBoundingClientRect().top + window.scrollY
                const wpAdminBar = document.getElementById('wpadminbar')

                if (wpAdminBar) {
                    offset -= wpAdminBar.offsetHeight
                }

                window.scrollTo({top: offset, behavior: 'smooth'})

                /*
                    $('html, body').animate({
                        scrollTop: offset
                    }, 500);
                */

            } else {
                return false;
            }
        }

    })
})

