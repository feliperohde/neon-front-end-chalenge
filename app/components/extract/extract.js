'use strict';
export default class Extract {
  constructor(options) {
    this.name = 'Extract';
    console.log('Extract module');

    const defaults = {
      extract: ".extract",
      extractExcludeBtn: ".extract__exlude",
      excludedItemState: "is-removed"
    }

    this.options = {...defaults, ...options};
    this.$ = document.querySelectorAll.bind(document);

    if(options.blurFilter) {
      this.options.blurFilter = this.$(this.options.blurFilter)[0];
    }

    this.listenRows();
  }

  excludeRow(target) {
    let row = target.parentNode.parentNode;
    row.classList.toggle(this.options.excludedItemState);
    row.parentNode.removeChild(row);
  }

  listenRows() {
    for (var i = this.$(this.options.extractExcludeBtn).length - 1; i >= 0; i--) {

      let elem = this.$(this.options.extractExcludeBtn)[i];

      elem.addEventListener('click', function() {
        this.excludeRow(elem);
      }.bind(this));
    }
  }
}