// Main javascript entry point
// Should handle bootstrapping/starting application

import Carousel from '../../components/carousel/carousel';
import Extract from '../../components/extract/extract';

document.addEventListener("DOMContentLoaded", () => {

  var neonExtractCarousel = new Carousel({blurFilter: "#blur-filter"});
  var neonExtract = new Extract({blurFilter: "#blur-filter"});

  neonExtractCarousel.goTo(1);

});