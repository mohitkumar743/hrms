/*
	Author: themexriver
	Version: 1.0
*/

(function ($) {
	"use strict";

	// tochspin for product count
	if ($("input.product-count").length) {
		$("input.product-count").TouchSpin({
			min: 1,
			max: 1000,
			step: 1,
			buttondown_class: "btn btn-link",
			buttonup_class: "btn btn-link",
		});
	}

	/*
	lenis-smooth-scroll-activation
*/
	const lenis = new Lenis({
		duration: 1,
		easing: (t) => 1 - Math.pow(1 - t, 4),
		direction: "vertical",
		smooth: true,
		smoothTouch: false,
	});
	function raf(time) {
		lenis.raf(time);
		requestAnimationFrame(raf);
	}
	requestAnimationFrame(raf);
	$('a[href^="#"]').on("click", function (e) {
		e.preventDefault();

		const target = $(this.getAttribute("href"));

		if (target.length) {
			lenis.scrollTo(target[0], {
				duration: 1.2,
				easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
			});
		}
	});
	gsap.config({
		nullTargetWarn: false,
	});

	/*
	sticky-header-function
*/

	function waStickyHeader() {
		var $window = $(window);
		var lastScrollTop = 0;
		var $header = $(".wa_sticky_header");
		var headerHeight = $header.outerHeight() + 30;

		$window.scroll(function () {
			var windowTop = $window.scrollTop();

			if (windowTop >= headerHeight) {
				$header.addClass("wa_sticky");
			} else {
				$header.removeClass("wa_sticky");
				$header.removeClass("wa_sticky_show");
			}

			if ($header.hasClass("wa_sticky")) {
				if (windowTop < lastScrollTop) {
					$header.addClass("wa_sticky_show");
				} else {
					$header.removeClass("wa_sticky_show");
				}
			}

			lastScrollTop = windowTop;
		});
	}

	waStickyHeader();

	/*
	offcanvas-function
*/

	$(".offcanvas_toggle").on("click", function () {
		$(".wa-overly, .offcanvas_box_active").addClass("active");
	});

	$(".wa-overly, .offcanvas_box_close").on("click", function () {
		$(".offcanvas_box_active").removeClass("active");
		$(".wa-overly").removeClass("active");
	});

	$(document).on("keydown", function (event) {
		if (event.key === "Escape") {
			$(".offcanvas_box_active").removeClass("active");
			$(".wa-overly").removeClass("active");
		}
	});

	$(".offcanvas_box_active a").on("click", function () {
		$(".offcanvas_box_active").removeClass("active");
		$(".wa-overly").removeClass("active");
	});

	/*
	mobile-dropdown-function
*/

	jQuery(".mobile-main-navigation li.dropdown").append(
		'<span class="dropdown-btn"><i class="fa-solid fa-angle-right"></i></span>'
	),
		jQuery(".mobile-main-navigation li .dropdown-btn").on(
			"click",
			function () {
				jQuery(this).hasClass("active")
					? (jQuery(this)
							.closest("ul")
							.find(".dropdown-btn.active")
							.toggleClass("active"),
					  jQuery(this)
							.closest("ul")
							.find(".dropdown-menu.active")
							.toggleClass("active")
							.slideToggle())
					: (jQuery(this)
							.closest("ul")
							.find(".dropdown-btn.active")
							.toggleClass("active"),
					  jQuery(this)
							.closest("ul")
							.find(".dropdown-menu.active")
							.toggleClass("active")
							.slideToggle(),
					  jQuery(this).toggleClass("active"),
					  jQuery(this)
							.parent()
							.find("> .dropdown-menu")
							.toggleClass("active"),
					  jQuery(this)
							.parent()
							.find("> .dropdown-menu")
							.slideToggle());
			}
		);

	/*
	search-popup-function
*/

	$(".search_btn_toggle").on("click", function () {
		$(".wa-overly, .search_box_active").addClass("active");
	});

	$(".wa-overly, .search_box_close").on("click", function () {
		$(".search_box_active").removeClass("active");
		$(".wa-overly").removeClass("active");
	});

	$(document).on("keydown", function (event) {
		if (event.key === "Escape") {
			$(".search_box_active").removeClass("active");
			$(".wa-overly").removeClass("active");
		}
	});

	/*
	windows-load-function
*/

	document.addEventListener("DOMContentLoaded", function () {
		window.addEventListener("load", function () {
			let preloader = document.querySelector(".nm-preloader");
			if (preloader) {
				preloader.classList.add("preloaded");
				setTimeout(function () {
					preloader.remove();
				}, 1000);
			}

			if (document.querySelectorAll(".pg-preloader").length) {
				const loader = document.querySelector(".pg-preloader");

				setTimeout(() => {
					loader.classList.add("loaded");
					initAfterPreloader();
				}, 500);
				setTimeout(function () {
					loader.remove();
				}, 1500);
			} else {
				initAfterPreloader();
			}

			afterPageLoad();
		});
	});

	/*
	after-preloader-start
*/
	function initAfterPreloader() {
		CustomEase.create("ease1", "0.23, 1, 0.32, 1");

		gsap.to(".sr-hero-2-apps-big-logo-shadow", {
			duration: 1,
			repeat: -1,
			repeatDelay: 3,
			scale: 1.5,
			opacity: 0,
		});
		/*
		only-LTR-direction
	*/
		if (getComputedStyle(document.body).direction !== "rtl") {
			/*
			section-title-1
		*/
			if ($(".sec_title_1").length) {
				var sec_title_1 = $(".sec_title_1");
				if (sec_title_1.length == 0) return;

				gsap.registerPlugin(SplitText);

				sec_title_1.each(function (index, el) {
					el.split = new SplitText(el, {
						type: "lines,words",
						linesClass: "split-line",
					});

					let delayValue = $(el).attr("data-split-delay") || "0s";
					delayValue = parseFloat(delayValue) || 0;

					if ($(el).hasClass("sec_title_1")) {
						gsap.set(el.split.words, {
							y: 30,
							filter: "blur(3px)",
							opacity: 0,
						});
					}

					el.anim = gsap.to(el.split.words, {
						scrollTrigger: {
							trigger: el,
							start: "top 90%",
							toggleActions: "play none none reverse",
						},
						y: 0,
						filter: "blur(0px)",
						opacity: 1,
						duration: 1,

						ease: "ease1",
						stagger: 0.08,
						delay: delayValue,
					});
				});
			}

			/*
			section-title-1
		*/
			if ($(".sec_title_2").length) {
				var sec_title_2 = $(".sec_title_2");
				if (sec_title_2.length == 0) return;

				gsap.registerPlugin(SplitText);

				sec_title_2.each(function (index, el) {
					el.split = new SplitText(el, {
						type: "lines,words",
						linesClass: "split-line",
					});

					let delayValue = $(el).attr("data-split-delay") || "0s";
					delayValue = parseFloat(delayValue) || 0;

					if ($(el).hasClass("sec_title_2")) {
						gsap.set(el.split.words, {
							x: 30,
							filter: "blur(3px)",
							opacity: 0,
						});
					}

					el.anim = gsap.to(el.split.words, {
						scrollTrigger: {
							trigger: el,
							start: "top 90%",
							toggleActions: "play none none reverse",
						},
						x: 0,
						filter: "blur(0px)",
						opacity: 1,
						duration: 1,

						ease: "ease1",
						stagger: 0.08,
						delay: delayValue,
					});
				});
			}

			/*
			section-title-1
		*/
			const wa_bg_position = new SplitText(".wa_bg_position", {
				type: "lines",
			});
			wa_bg_position.lines.forEach((target) => {
				gsap.to(target, {
					backgroundPositionX: 50,
					ease: "none",
					scrollTrigger: {
						trigger: target,
						scrub: true,
						start: "top 80%",
						end: "bottom center",
					},
				});
			});
		}

		/*
	after-preloader-end
*/
	}

	/*
	after-page-load-start
*/
	function afterPageLoad() {
		/*
        hero-2-svg-animation
    */
  		gsap.registerPlugin(MotionPathPlugin);
		gsap.utils.toArray(".main-line").forEach((path, i) => {
			let moveLine = document.querySelectorAll(".move-line")[i];
			gsap.set(moveLine, { opacity: 0 });
			if (moveLine) {
				gsap.to(moveLine, {
					duration: 8,
					repeat: -1,
					ease: "none",
					delay: i === 0 ? 0 : 2.8,
					motionPath: {
						path: path,
						align: path,
						autoRotate: true,
						alignOrigin: [0.5, 0.5],
						start: 1,
						end: 0,
					},
					onStart: () =>
						gsap.to(moveLine, { opacity: 1, duration: 0.3 }),
				});
			}
		});

		gsap.utils.toArray(".main-line2").forEach((path, i) => {
			let moveLine2 = document.querySelectorAll(".move-line2")[i];
			gsap.set(moveLine2, { opacity: 0 });
			if (moveLine2) {
				gsap.to(moveLine2, {
					duration: 8,
					repeat: -1,
					ease: "none",
					delay: i === 0 ? 0 : 2.8,
					motionPath: {
						path: path,
						align: path,
						autoRotate: true,
						alignOrigin: [0.5, 0.5],
						start: 1,
						end: 0,
					},
					onStart: () =>
						gsap.to(moveLine2, { opacity: 1, duration: 0.3 }),
				});
			}
		});

		/*
		add-active-class
	*/
		const waAddClass = gsap.utils.toArray(".wa_add_class");
		waAddClass.forEach((waAddClassItem) => {
			gsap.to(waAddClassItem, {
				scrollTrigger: {
					trigger: waAddClassItem,
					start: "top 90%",
					end: "bottom bottom",
					toggleActions: "play none none reverse",
					toggleClass: "active",
					once: true,
					markers: false,
				},
			});
		});

		/*
		wow-activation
	*/
		if ($(".wow").length) {
			var wow = new WOW({
				boxClass: "wow",
				animateClass: "animated",
				offset: 50,
				mobile: true,
				live: true,
			});
			wow.init();
		}

		/*
	after-page-load-start
*/
	}

	// wa-bg-parallax
	gsap.utils.toArray(".wa_parallax_bg").forEach((element) => {
		gsap.fromTo(
			element,
			{ backgroundPosition: "50% 0%" },
			{
				backgroundPosition: "50% 100%",
				ease: "none",
				scrollTrigger: {
					trigger: element,
					scrub: 2,
					markers: false,
				},
			}
		);
	});

	/*
    subtitle-1-icon
*/
	gsap.utils.toArray(".subtitle_1_icon").forEach((item) => {
		gsap.from(item, {
			scale: 0,
			ease: "ease1",
			duration: 0.5,
			scrollTrigger: {
				trigger: item,
				start: "top 86%",
				toggleActions: "play none none reverse",
				markers: false,
			},
		});
	});

	/*
    subtitle-1-text
*/
	gsap.utils.toArray(".subtitle_1_text").forEach((item) => {
		gsap.from(item, {
			x: -32,
			ease: "ease1",
			duration: 0.5,
			scrollTrigger: {
				trigger: item,
				start: "top 86%",
				toggleActions: "play none none reverse",
				markers: false,
			},
		});
	});

	/*
    header-1-menu-link
*/
	if ($(".header_1_menu_link").length) {
		var header_1_menu_link = $(".header_1_menu_link .dropdown-menu a");
		gsap.registerPlugin(SplitText);

		header_1_menu_link.each(function (index, el) {
			el.split = new SplitText(el, {
				type: "words",
			});

			$(el).on("mouseenter", function () {
				gsap.fromTo(
					el.split.words,
					{ x: -5, opacity: 0, filter: "blur(1px)" },
					{
						x: 0,
						opacity: 1,
						filter: "blur(0px)",
						duration: 0.8,
						stagger: -0.2,
						ease: "ease1",
					}
				);
			});
		});
	}

	/*
    pr-button-1-split
*/
	if ($(".btn_split_1").length) {
		var splitButton1 = $(".btn_split_1");
		gsap.registerPlugin(SplitText);

		splitButton1.each(function (index, el) {
			el.split = new SplitText(el, {
				type: "words",
			});

			$(el).on("mouseenter", function () {
				gsap.fromTo(
					el.split.words,
					{ x: -30, opacity: 1, filter: "blur(5px)" },
					{
						x: 0,
						opacity: 1,
						filter: "blur(0px)",
						duration: 0.5,
						stagger: -0.1,
						ease: "ease1",
					}
				);
			});
		});
	}

	if ($(".wa_hero").length) {
		var waMagnets2v2 = document.querySelectorAll(".wa_hero");
		var waStrength2v2 = 0.5;

		waMagnets2v2.forEach((magnet) => {
			magnet.addEventListener("mousemove", moveMagnet2);
			magnet.addEventListener("mouseout", function (event) {
				const innerElements =
					event.currentTarget.querySelectorAll(".wa_hero_elm");
				innerElements.forEach((elm) => {
					gsap.to(elm, {
						x: 0,
						y: 0,
						duration: 1,
						ease: "ease1",
					});
				});
			});
		});

		function moveMagnet2(event) {
			var magnetButton = event.currentTarget;
			var bounding = magnetButton.getBoundingClientRect();
			const innerElements = magnetButton.querySelectorAll(".wa_hero_elm");

			const xMove =
				((event.clientX - bounding.left) / magnetButton.offsetWidth -
					0.5) *
				waStrength2v2;
			const yMove =
				((event.clientY - bounding.top) / magnetButton.offsetHeight -
					0.5) *
				waStrength2v2;

			innerElements.forEach((elm) => {
				gsap.to(elm, {
					x: xMove,
					y: yMove,
					duration: 1,
					ease: "ease1",
				});
			});
		}
	}

	if ($(".wa_btn").length) {
		var waMagnets2v2 = document.querySelectorAll(".wa_btn");
		var waStrength2v2 = 70;

		waMagnets2v2.forEach((magnet) => {
			magnet.addEventListener("mousemove", moveMagnet2);
			magnet.addEventListener("mouseout", function (event) {
				const innerElements =
					event.currentTarget.querySelectorAll(".wa_btn_elm");
				innerElements.forEach((elm) => {
					gsap.to(elm, {
						x: 0,
						y: 0,
						duration: 1,
						ease: "ease1",
					});
				});
			});
		});

		function moveMagnet2(event) {
			var magnetButton = event.currentTarget;
			var bounding = magnetButton.getBoundingClientRect();
			const innerElements = magnetButton.querySelectorAll(".wa_btn_elm");

			const xMove =
				((event.clientX - bounding.left) / magnetButton.offsetWidth -
					0.5) *
				waStrength2v2;
			const yMove =
				((event.clientY - bounding.top) / magnetButton.offsetHeight -
					0.5) *
				waStrength2v2;

			innerElements.forEach((elm) => {
				gsap.to(elm, {
					x: xMove,
					y: yMove,
					duration: 1,
					ease: "ease1",
				});
			});
		}
	}

	/*
    hover-1-split
*/
	if ($(".hover_1_split").length) {
		var hover_1_split = $(".hover_1_split a");
		gsap.registerPlugin(SplitText);

		hover_1_split.each(function (index, el) {
			el.split = new SplitText(el, {
				type: "words",
			});

			$(el).on("mouseenter", function () {
				gsap.fromTo(
					el.split.words,
					{ x: 0, opacity: 1, filter: "blur(0px)" },
					{
						x: 5,
						opacity: 1,
						filter: "blur(.5px)",
						duration: 0.5,
						stagger: -0.1,
						ease: "ease1",
					}
				);
			});

			$(el).on("mouseleave", function () {
				gsap.to(el.split.words, {
					x: 0,
					opacity: 1,
					filter: "blur(0px)",
					duration: 0.5,
					stagger: 0.1,
					ease: "ease1",
				});
			});
		});
	}

	/*
	hero-1-shape-animation
*/
	if ($(".sr-hero-1-cursor-shape").length) {
		var $bsH1shape = $(".sr-hero-1-cursor-shape");
		var $bsH1area = $(".sr-hero-1-cursor");

		function bsH1moveCircle(e) {
			var offset = $bsH1area.offset();
			var relativeX = e.pageX - offset.left;
			var relativeY = e.pageY - offset.top;

			TweenLite.to($bsH1shape, 0.3, {
				css: {
					left: relativeX + "px",
					top: relativeY + "px",
				},
			});
		}

		$bsH1area.on("mousemove", bsH1moveCircle);
	}

	/*
    faqs-1-sticky
*/
	if ($(".sr-faqs-1-content-pin").length) {
		if (window.matchMedia("(min-width: 992px)").matches) {
			gsap.to(".sr-faqs-1-content-pin", {
				scrollTrigger: {
					trigger: ".sr-faqs-1-wrap",
					start: "top 20%",
					end: () => {
						const rightHeight = document.querySelector(
							".sr-faqs-1-accordion"
						).offsetHeight;
						const leftHeight =
							document.querySelector(
								".sr-faqs-1-content"
							).offsetHeight;
						return "+=" + (rightHeight - leftHeight);
					},
					pin: ".sr-faqs-1-content-pin",
					pinSpacing: false,
					markers: false,
				},
			});
		}
	}

	/*
    blog-1-sticky
*/
	if ($(".sr-blog-1-content-pin").length) {
		if (window.matchMedia("(min-width: 992px)").matches) {
			gsap.to(".sr-blog-1-content-pin", {
				scrollTrigger: {
					trigger: ".sr-blog-1-wrap",
					start: "top 20%",
					end: () => {
						const rightHeight =
							document.querySelector(
								".sr-blog-1-right"
							).offsetHeight;
						const leftHeight =
							document.querySelector(
								".sr-blog-1-content"
							).offsetHeight;
						return "+=" + (rightHeight - leftHeight);
					},
					pin: ".sr-blog-1-content-pin",
					pinSpacing: false,
					markers: false,
				},
			});
		}
	}

	/*
	features-3-svg-1
*/
	var features3svg1 = gsap.timeline({
		scrollTrigger: {
			trigger: ".sr-features-3-svg-1",
			toggleActions: "play none none reverse",
			start: "top 85%",
			markers: false,
		},
	});

	features3svg1.from(".sr-features-3-svg-1 .has-ani", {
		opacity: 0,
		duration: 0.4,
		stagger: 0.4,
	});

	var features3svg2 = gsap.timeline({
		scrollTrigger: {
			trigger: ".sr-features-3-svg-2",
			toggleActions: "play none none reverse",
			start: "top 85%",
			markers: false,
		},
	});

	features3svg2.from(".sr-features-3-svg-2 .has-ani", {
		scaleY: 0,
		duration: 0.4,
		stagger: 0.4,
		transformOrigin: "bottom",
	});

	var features3svg3 = gsap.timeline({
		scrollTrigger: {
			trigger: ".sr-features-3-svg-3",
			toggleActions: "play none none reverse",
			start: "top 85%",
			markers: false,
		},
	});

	features3svg3.from(".sr-features-3-svg-3 .has-ani", {
		scaleY: 0,
		duration: 0.4,
		stagger: 0.2,
		transformOrigin: "bottom",
	});

	/*
	price-4-hover-active
*/
	$(".sr-price-4-card").on("mouseover", function () {
		var current_class = document.getElementsByClassName(
			"sr-price-4-card active"
		);
		current_class[0].className = current_class[0].className.replace(
			" active",
			""
		);
		this.className += " active";
	});

	/*
	faqs-4-hover-active
*/

	$(".sr-faqs-4-item-single").on("click", function () {
		if ($(this).hasClass("active")) {
			$(this).removeClass("active");
		} else {
			$(".sr-faqs-4-item-single").removeClass("active");
			$(this).addClass("active");
		}
	});

	/*
	highlight-4-btn
*/
	if (window.matchMedia("(min-width: 992px)").matches) {
		var highlight4btn = gsap.timeline({
			scrollTrigger: {
				trigger: ".sr-highlights-4-wrap",
				toggleActions: "play none none reverse",
				start: "top 85%",
				scrub: true,
				markers: false,
			},
		});

		highlight4btn.from(".sr-highlights-4-all-btn", {
			transform: "translate(-50%, 0%)",
		});
	}

	/*
	testimonial-5-slider-function
*/
	if ($(".t5_slider_active").length) {
		var t5_slider_active = new Swiper(".t5_slider_active", {
			loop: true,
			speed: 600,
			spaceBetween: 0,
			// slidesPerView: "auto",

			autoplay: {
				delay: 5000,
			},
		});
	}

	/*
    marquee-right
*/

	$(".wa_marquee_right").marquee({
		speed: 50,
		gap: 0,
		delayBeforeStart: 0,
		startVisible: true,
		direction: "right",
		duplicated: true,
		pauseOnHover: true,
	});

	/*
    marquee-left
*/

	$(".wa_marquee_left").marquee({
		speed: 50,
		gap: 0,
		delayBeforeStart: 0,
		startVisible: true,
		direction: "left",
		duplicated: true,
		pauseOnHover: true,
	});

	/*
    marquee-left-nopause
*/
	$(".wa_marquee_left_nopause").marquee({
		speed: 20,
		gap: 0,
		delayBeforeStart: 0,
		startVisible: true,
		direction: "left",
		duplicated: true,
		pauseOnHover: false,
	});

	/*
    marquee-right-nopause
*/
	$(".wa_marquee_right_nopause").marquee({
		speed: 20,
		gap: 0,
		delayBeforeStart: 0,
		startVisible: true,
		direction: "right",
		duplicated: true,
		pauseOnHover: false,
	});

	// placeholder-typing
	document
		.querySelectorAll(".wa_placeholder")
		.forEach((waPlaceholderInput) => {
			const waPlaceholderText = waPlaceholderInput.placeholder;
			const waStartDelay = waPlaceholderInput.dataset.startDelay
				? parseInt(waPlaceholderInput.dataset.startDelay)
				: 0;
			let waPlaceholderIndex = 0;
			waPlaceholderInput.placeholder = "";

			const waPlaceholderObserver = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							waPlaceholderType();
							waPlaceholderObserver.unobserve(waPlaceholderInput);
						}
					});
				},
				{ threshold: 0.5 }
			);

			setTimeout(() => {
				waPlaceholderObserver.observe(waPlaceholderInput);
			}, waStartDelay);

			function waPlaceholderType() {
				if (waPlaceholderIndex < waPlaceholderText.length) {
					waPlaceholderInput.placeholder +=
						waPlaceholderText.charAt(waPlaceholderIndex);
					waPlaceholderIndex++;
					setTimeout(waPlaceholderType, 70);
				}
			}
		});

	/*
	bootstrap-tooltip-activation
*/
	$(function () {
		$('[data-toggle="tooltip"]').tooltip();
	});

	/*
	back-to-top-button-function
*/
	if ($(".wa_backToTop").length) {
		var scrollTopbtn = document.querySelector(".wa_backToTop");
		var offset = 500;
		var duration = 1000;

		$(window).on("scroll", function () {
			if ($(this).scrollTop() > offset) {
				$(scrollTopbtn).addClass("active");
			} else {
				$(scrollTopbtn).removeClass("active");
			}
		});

		$(scrollTopbtn).on("click", function (event) {
			event.preventDefault();
			$("html, body").animate({ scrollTop: 0 }, duration, "swing");
		});
	}

	/*
	popup-video-activation
*/
	if ($(".popup_video").length) {
		$(".popup_video").magnificPopup({
			type: "iframe",
		});
	}

	/*
	popup-image-activation
*/
	if ($(".popup_img").length) {
		$(".popup_img").magnificPopup({
			type: "image",
			gallery: {
				enabled: true,
			},
		});
	}

	/*
	nice-selector-activation
*/
	if ($(".nice-select").length) {
		$(".nice-select select").niceSelect();
	}

	/*
	background-image-function
*/
	$("[data-background]").each(function () {
		$(this).css(
			"background-image",
			"url(" + $(this).attr("data-background") + ") "
		);
	});

	/*
	counter-activation
*/

	if ($(".counter").length) {
		$(".counter").counterUp({
			delay: 10,
			time: 5000,
		});

		let elements = document.querySelectorAll(".wa-counter");

		elements.forEach((element) => {
			let innerWidth = element.clientWidth;
			element.style.width = innerWidth + "px";
		});
	}

	/*
    odomater-activation
*/

	$(".odometer").appear(function () {
		var $this = $(this);
		var countNumber = $this.attr("data-count");
		$this.html(countNumber);
	});

	/*
	current-year-function
*/
	if ($(".copyright-year").length) {
		const currentYear = new Date().getFullYear();
		$(".copyright-year").text(currentYear);
	}
})(jQuery);
