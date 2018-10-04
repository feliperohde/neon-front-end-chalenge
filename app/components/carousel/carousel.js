'use strict';

import Throttle from '../../utils/throttle/throttle';
import Debounce from '../../utils/debounce/debounce';

export default class Carousel {
  constructor(options) {
    this.name = 'Carousel';
    console.log('Carousel module');

    const defaults = {
      carousel: ".carousel",
      carouselItem: ".carousel__item",
      carouselControl: ".carouselControl__item",
      currentClass: "is-current"
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
    this.listemControls();
  }

  setCurrent(index) {
    this.removeSiblingsClass();
    this.$(this.options.carouselControl)[index].classList.toggle(this.options.currentClass)
  }

  goTo(item) {

    if(this.$(this.options.carouselItem)[item]){

      this.setCurrent(item);

      if(this.options.blurFilter) {
        this.$(this.options.carousel)[0].classList.add('apply-blur');
      }

      let element = this.$(this.options.carousel)[0];
      let scroll = item * this.itemWidth + (parseInt(this.itensMarginLeft,10) * item);

      this.isAnimating = true;
      this.scrollTo(element, scroll, 300, function(){
        this.isAnimating =  false;

        setTimeout(function() {
          this.$(this.options.carousel)[0].classList.remove('apply-blur');
        }.bind(this), 100);

      }.bind(this));

    }
  }

  listemControls() {
    for (var i = this.$(this.options.carouselControl).length - 1; i >= 0; i--) {
      let elem = this.$(this.options.carouselControl)[i];
      elem.addEventListener('click', function (evt) {
        evt.preventDefault();
        let index = Array.from(elem.parentElement.children).indexOf(elem)
        this.goTo(index);

      }.bind(this))
    }
  }

  removeSiblingsClass() {
    for (var i = this.$(this.options.carouselControl).length - 1; i >= 0; i--) {
      let elem = this.$(this.options.carouselControl)[i];
      elem.classList.remove(this.options.currentClass);
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

        this.setBlur("0,0");
      }
    }.bind(this), 700);

    this.$(this.options.carousel)[0].addEventListener('scroll', throttled);
    this.$(this.options.carousel)[0].addEventListener('scroll', debounced);

    this.$(this.options.carousel)[0].addEventListener('touchstart', function() {
      this.hasTouched = true;
    }.bind(this));

    this.$(this.options.carousel)[0].addEventListener('ontouchmove', function() {
      this.hasTouched = true;
    }.bind(this));

    this.$(this.options.carousel)[0].addEventListener('touchend', function() {
      this.hasTouched = false;
      if(self.endCall) debounced();
    }.bind(this));

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
  //https://easings.net/
  //https://github.com/danro/jquery-easing/blob/master/jquery.easing.js
  easeInOutCubic(t, b, c, d) {
    return c*((t=t/d-1)*t*t + 1) + b;
  }

  scrollTo(element, to, duration, callback) {
    var start = element.scrollLeft,
        change = to - start,
        currentTime = 0,
        increment = 20;

    var animateScroll = function(){
        currentTime += increment;
        var val = this.easeInOutCubic(currentTime, start, change, duration);
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
