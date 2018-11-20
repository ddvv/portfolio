var slider = (function() {
    var duration = 600;
    var inAnimate = false;
  
    var moveSlide = function(container, direction, move) {
      var items = $(".slider__item", container);
      var activeItem = items.filter(".active");
      var counter = activeItem.index();
      
      direction == "down" ? direction = 100 : direction = -100 ;
      move == "next" ? counter++ : counter-- ;
            
      if (counter >= items.length) {
        counter = 0;
      }else if (counter < 0) {
        counter = items.length - 1;
      }
  
      var reqItem = items.eq(counter); // на какой слайд перейти
      
      // старый слайд слева двигается на 100% (вниз)
      // старый слайд справа двигается на -100% (вверх)
      activeItem.animate(
        {
          top: direction + "%"
        },
        duration
      );
      
      // двигает новый слайд вниз, потом переносит старый обратно (вверх для левого)
      // двигает новый слайд вверх, потом переносит старый обратно (вниз для левого)
      reqItem.animate(
        {
          top: 0
        },
        duration,
        function() {
          activeItem.removeClass("active").css("top", direction * -1 + "%");
          $(this).addClass("active");
  
          inAnimate = false;
        }
      );
    };
  
    return {
      init: function() {
        $(".slider__controls-top").on("click", function(e) {
          e.preventDefault;
  
          if (!inAnimate) {
            inAnimate = true;
            moveSlide($(".slider_first"), "down", "next");
            moveSlide($('.slider_opposite'), 'up', "next");
          }
        });
  
        $(".slider__controls-down").on("click", function(e) {
          e.preventDefault;
  
          if (!inAnimate) {
            inAnimate = true;
            moveSlide($(".slider_first"), "down", "prev");
            moveSlide($('.slider_opposite'), 'up', "prev");
          }
        });
      }
    };
  })();
  
module.exports = slider;