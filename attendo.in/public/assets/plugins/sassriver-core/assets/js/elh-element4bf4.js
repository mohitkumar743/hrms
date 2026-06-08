(function ($) {
  "use strict";

  $(window).on("elementor/frontend/init", function () {
    var txHeroParallax = function ($scope) {
      var $heroSection = $scope.find(".sr-hero-1-area");
      if (!$heroSection.length) return;

      $heroSection.on("mousemove", function (e) {
        var w = $(window).width();
        var h = $(window).height();
        var offsetX = 0.5 - e.pageX / w;
        var offsetY = 0.5 - e.pageY / h;

        $heroSection.find(".sr-parallax-item").each(function (i, el) {
          var offset = parseInt($(el).data("parallax-speed"), 10);
          if (isNaN(offset)) offset = 20;

          var translate =
            "translate3d(" +
            Math.round(offsetX * offset) +
            "px," +
            Math.round(offsetY * offset) +
            "px, 0px)";

          $(el).css({
            "-webkit-transform": translate,
            transform: translate,
            "moz-transform": translate
          });
        });
      });
    };

    var txHeroTilt = function ($scope) {
      $scope.find(".sr-tilt-item").each(function (i, el) {
        var $el = $(el);
        var maxTilt = parseInt($el.data("tilt-max"), 10) || 20;
        var perspective = parseInt($el.data("tilt-perspective"), 10) || 1000;

        $el.on("mousemove", function (e) {
          var offset = $el.offset();
          var width = $el.width();
          var height = $el.height();
          var centerX = offset.left + width / 2;
          var centerY = offset.top + height / 2;
          var mouseX = e.pageX - centerX;
          var mouseY = e.pageY - centerY;
          var rotateX = ((maxTilt * mouseY) / (height / 2)).toFixed(2);
          var rotateY = (-(maxTilt * mouseX) / (width / 2)).toFixed(2);

          $el.css({
            transform:
              "perspective(" +
              perspective +
              "px) rotateX(" +
              rotateX +
              "deg) rotateY(" +
              rotateY +
              "deg)",
            transition: "none"
          });
        });

        $el.on("mouseleave", function () {
          $el.css({
            transform:
              "perspective(" +
              perspective +
              "px) rotateX(0deg) rotateY(0deg)",
            transition: "all 0.5s ease"
          });
        });
      });
    };

    elementorFrontend.hooks.addAction(
      "frontend/element_ready/tx_hero_section.default",
      function ($scope) {
        txHeroParallax($scope);
        txHeroTilt($scope);
      }
    );
  });
})(jQuery);
