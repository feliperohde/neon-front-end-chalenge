// Main javascript entry point
// Should handle bootstrapping/starting application

import Carousel from '../../components/carousel/carousel';

document.addEventListener("DOMContentLoaded", () => {

  var neonExtractCarousel = new Carousel();

  neonExtractCarousel.goTo(1);

});