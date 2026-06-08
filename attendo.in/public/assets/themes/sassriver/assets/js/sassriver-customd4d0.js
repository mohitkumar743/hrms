(function ($) {
	"use strict";

	function afterPreloader(callback) {
		let preloader = document.querySelector(".lb-preloader");

		if (preloader) {
			// add fade class
			preloader.classList.add("preloaded");

			setTimeout(function () {
				preloader.remove();
				if (typeof callback === "function") {
					callback();
				}
			}, 500); // match your preloader timeout
		} else {
			// no preloader found → run immediately
			if (typeof callback === "function") {
				callback();
			}
		}
	}

	// image background
	function bgImageActive($scope, $) {
		$("[data-background]").each(function () {
			$(this).css(
				"background-image",
				"url(" + $(this).attr("data-background") + ") "
			);
		});
	}

	// data-bg-color
	function bgColorActive($scope, $) {
		$("[data-bg-color]").each(function () {
			$(this).css("background-color", $(this).attr("data-bg-color"));
		});
	}

	// functtion tx_testimonial
	function tx_testimonial($scope, $) {
		if ($(".sr_t1_slider_active").length) {
			var sr_t1_slider_active = new Swiper(".sr_t1_slider_active", {
				loop: true,
				speed: 600,
				spaceBetween: 24,

				pagination: {
					el: ".sr_t1_pagination",
					clickable: true,
				},

				breakpoints: {
					0: {
						slidesPerView: 1,
					},
					576: {
						slidesPerView: 1,
					},
					768: {
						slidesPerView: 2,
					},
					992: {
						slidesPerView: 2,
					},
					1200: {
						slidesPerView: 3,
					},
				},
			});
		}

		if ($(".t2_slider_active").length) {
			var t2_slider_active = new Swiper(".t2_slider_active", {
				loop: true,
				speed: 600,
				spaceBetween: 24,
				pagination: {
					el: ".sr_t2_pagination",
					clickable: true,
				},
				breakpoints: {
					0: {
						slidesPerView: 1,
					},
					576: {
						slidesPerView: 1,
					},
					768: {
						slidesPerView: 1,
					},
					992: {
						slidesPerView: 2,
					},
				},
			});
		}

				if ($(".s4_slider_active").length) {
			var s4_slider_active = new Swiper(".s4_slider_active", {
				loop: true,
				speed: 600,
				spaceBetween: 0,
				slidesPerView: "auto",
				direction: "vertical",

				allowTouchMove: false,

				navigation: {
					nextEl: ".sr_s4_next",
					prevEl: ".sr_s4_prev",
				},
			});
		}
	}

	$(window).on("elementor/frontend/init", function () {
		elementorFrontend.hooks.addAction(
			"frontend/element_ready/tx_hero_section.default",
			function ($scope, $) {
				bgImageActive($scope, $);
				// afterPreloader(function () {
				// 	tx_hero_section($scope, $);
				// });
			}
		);
		elementorFrontend.hooks.addAction(
			"frontend/element_ready/tx_testimonial.default",
			function ($scope, $) {
				tx_testimonial($scope, $);
			}
		);
	});
})(jQuery);
