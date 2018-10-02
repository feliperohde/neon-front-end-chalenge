'use strict';

export default class DomManipulate {
  constructor(selector) {
    this.name = 'DomManipulate';
    console.log('DomManipulate module');

    document.addEventListener("DOMContentLoaded", () => {

      this.element=document.querySelector(selector);

      if (typeof this.callback === 'function')
        this.callback();

   });
  }

  onReady(callback) {
    this.callback=callback;
  }

  getElement() {
    return this.element;
  }

  write(text) {
    return this.element.innerText=text;
  }
}
