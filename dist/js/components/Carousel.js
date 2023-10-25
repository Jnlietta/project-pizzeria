

class Carousel {
    constructor(element) {
      const thisCarousel = this;

      this.render(element);
      this.initPlugin();
    }
  
    render(element) {
     // save element ref to this obj
        const thisCarousel =this;

        thisCarousel.element = element;
        
    }
  
    initPlugin() {
      // use plugin to create carousel on thisCarousel.element
      
    }
  }

  export default Carousel;