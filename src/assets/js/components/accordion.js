export const it_faq_accordion = () => {
	$(document).on('click', '.js-accordion-title', function () {
		const accordion = $(this).closest('.js-accordion'),
			accordionItem = $(this).closest('.js-accordion-item');

		/*
		 * Next two lines of code, will close all opened accordion items.
		 * Remove them if you want accordion items open/close independently.
		 */
		if (!accordionItem.hasClass('is-open')) {
			accordion.find('.js-accordion-item').removeClass('is-open');
			accordion.find('.js-accordion-content').stop().slideUp();
		}

		// Handling all the toggles.
		accordionItem.toggleClass('is-open');
		accordionItem.find('.js-accordion-content').stop().slideToggle();
	});
};
