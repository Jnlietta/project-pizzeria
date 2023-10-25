

class Carousel {
    constructor(element) {
      //const thisCarousel = this;

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
      const elem = document.querySelector('.main-carousel');
      new Flickity( elem, {
        // options
        cellAlign: 'left',
        contain: true
      });
      
    //   // element argument can be a selector string
    //   //   for an individual element
    //   const flkty = new Flickity( '.main-carousel', {
    //     // options
    //   });
    }
  }

  export default Carousel;