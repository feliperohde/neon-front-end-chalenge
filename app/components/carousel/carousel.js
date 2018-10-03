'use strict';

import Throttle from '../../utils/throttle/throttle';
import Debounce from '../../utils/debounce/debounce';

export default class Carousel {
  constructor(options) {
    this.name = 'Carousel';
    console.log('Carousel module');

    const defaults = {
      carousel: ".carousel",
      carouselItem: ".carousel__item"
    }

    this.options = {...defaults, ...options};
    this.$ = document.querySelectorAll.bind(document);

    this.currentPage = 0;
    this.totalPages = this.$(this.options.carouselItem).length;
    this.itemWidth = this.$(this.options.carouselItem)[0].offsetWidth;
    this.itensMarginLeft = document.defaultView.getComputedStyle(this.$(this.options.carouselItem)[1], "").getPropertyValue("margin-left").replace(/\D/g,'');
    this.snapTo = null;
    this.hasTouched = false;
    this.endCall = false;
    this.isAnimating = false;

    if(options.blurFilter) {
      this.options.blurFilter = this.$(this.options.blurFilter)[0];
      this.lastPos = 0;
      this.updateBlur();
    }

    console.log(this);
    this.snap();
  }

  goTo(item) {

    if(this.$(this.options.carouselItem)[item]){

      let element = this.$(this.options.carousel)[0];
      let scroll = item * this.itemWidth + (parseInt(this.itensMarginLeft,10) * item);

      this.isAnimating = true;
      this.scrollTo(element, scroll, 800, function(){
        this.isAnimating =  false;
      }.bind(this));

    }
  }

  snap() {

    let throttled = new Throttle(function() {
      // if(this.options.blurFilter)
      //   this.updateBlur();
      this.snapTo = Math.round(this.$(this.options.carousel)[0].scrollLeft / this.itemWidth);
    }.bind(this), 50);

    let debounced = new Debounce(function(){
      if(!this.hasTouched && !this.isAnimating) {
        setTimeout(function(){
          this.goTo(this.snapTo);
        }.bind(this), 150);
        this.endCall = false;
      } else {
        this.endCall = true;
      }
    }.bind(this), 700);

    this.$(this.options.carousel)[0].addEventListener('scroll', throttled);
    this.$(this.options.carousel)[0].addEventListener('scroll', debounced);

    this.$(this.options.carousel)[0].addEventListener('touchstart', function() {
      this.hasTouched = true;
    });
    this.$(this.options.carousel)[0].addEventListener('ontouchmove', function() {
      this.hasTouched = true;
    });

    this.$(this.options.carousel)[0].addEventListener('touchend', function() {
      this.hasTouched = false;
      if(self.endCall) debounced();
    });

  }

  setBlur(v) {
    this.options.blurFilter.setAttribute("stdDeviation", v);
  }

  getPos() {
    return this.$(this.options.carousel)[0].scrollLeft;
  }

  updateBlur() {
    var pos = this.getPos();
    var limit = 20;
    var dx = Math.min(limit, Math.abs(this.lastPos - pos) * 0.5);
    // var dy = Math.min(limit, 0);
    this.setBlur(dx + "," + 0);

    this.lastPos = pos;
    // requestAnimationFrame(this.updateBlur());
  }

  //t = current time
  //b = start value
  //c = change in value
  //d = duration
  easeInOutQuad(t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2*t*t + b;
    t--;
    return -c/2 * (t*(t-2) - 1) + b;
  }

  scrollTo(element, to, duration, callback) {
    var start = element.scrollLeft,
        change = to - start,
        currentTime = 0,
        increment = 20;

    var animateScroll = function(){
        currentTime += increment;
        var val = this.easeInOutQuad(currentTime, start, change, duration);
        element.scrollLeft = val;
        if(currentTime < duration) {
            setTimeout(animateScroll, increment);
            if(this.options.blurFilter)
              this.updateBlur();
        } else {
          callback();
        }
    }.bind(this);

    animateScroll();
  }
}
