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
      currentClass: "is-current",
      transitionTime: 500
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

      this.$(this.options.carousel)[0].classList.add('apply-blur');

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

    if(this.$(this.options.carouselItem)[item]) {

      this.setCurrent(item);

      let element = this.$(this.options.carousel)[0];
      let scroll = item * this.itemWidth + (parseInt(this.itensMarginLeft,10) * item);

      this.isAnimating = true;
      this.scrollTo(element, scroll, this.options.transitionTime, function(){
        this.isAnimating =  false;
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
      this.snapTo = Math.round(this.$(this.options.carousel)[0].scrollLeft / this.itemWidth);
    }.bind(this), 50);

    let debounced = new Debounce(function() {
      if(!this.hasTouched && !this.isAnimating) {
        setTimeout(function(){
          this.goTo(this.snapTo);
        }.bind(this), 150);
        this.endCall = false;
      } else {
        this.endCall = true;
      }
    }.bind(this), 60);

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
      if(this.endCall) debounced();
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
    var limit = 40;
    var dx = Math.min(limit, Math.abs(pos - this.lastPos) * 0.5);
    // var dy = Math.min(limit, 0);
    this.setBlur(dx + "," + 0);

    this.lastPos = pos;
    requestAnimationFrame(this.updateBlur.bind(this));
  }

  //t = current time
  //b = start value
  //c = change in value
  //d = duration
  //https://easings.net/
  //https://github.com/danro/jquery-easing/blob/master/jquery.easing.js
  easeInOutExpo(t, b, c, d) {
    if (t==0) return b;
    if (t==d) return b+c;
    if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
    return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
  }

  scrollTo(element, to, duration, callback) {
    var start = element.scrollLeft,
        change = to - start,
        currentTime = 0,
        increment = 20;

    var animateScroll = function(){
        currentTime += increment;
        var val = this.easeInOutExpo(currentTime, start, change, duration);
        element.scrollLeft = val;
        if(currentTime < duration) {
            setTimeout(animateScroll, increment);
        } else {
          callback();
        }
    }.bind(this);

    animateScroll();
  }
}
