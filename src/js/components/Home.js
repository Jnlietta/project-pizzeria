import { templates } from "../settings.js";
import utils from "../utils.js";
import Carousel from "./Carousel.js";

class Home {
    constructor(container){
        const thisHome  = this;

        thisHome.element = container;       //div w html w którzym bedzie zawartość tej klasy

        thisHome.render(container);
        thisHome.getElements(container);
        //thisHome.initWidgets();               //wywołamy ta metode dopiero po załadowaniu strony home w init pages aby karuzela działa

    }

    render(container){
        const thisHome = this;

        /* generate HTML based on template */
        const generatedHTML = templates.homePage();

        /* create element using utils.createElementFromHTML */
        thisHome.elementDOM = utils.createDOMFromHTML(generatedHTML);

        /* find page container */
        /* add element to page */
        container.appendChild(thisHome.elementDOM);     //dodaj dziecko do elementu nowy html
    }

    getElements(container){
        const thisHome = this;

        thisHome.dom = {};

        thisHome.dom.ordersWrapper = container.querySelector('.orders');
        //thisHome.dom.ordersImg = thisHome.dom.ordersWrapper.querySelector('img');
        //console.log(thisHome.dom.ordersImg);

        thisHome.dom.carouselsWrapper = container.querySelector('.main-carousel');
    }

    initWidgets(){
        const thisHome = this;

        thisHome.Carousel = new Carousel(thisHome.dom.carouselsWrapper);
    }

    initActions(){
        const thisHome = this;

        thisHome.dom.ordersImg.addEventListener('click', function(event){
            event.preventDefault();
            
            console.log('chciałam dodać opcje przejścia na podstrone orders');
        });
    }
    
}

export default  Home;