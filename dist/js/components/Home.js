import { templates } from "../settings.js";
import utils from "../utils.js";

class Home {
    constructor(container){
        const thisHome  = this;

        thisHome.element = container;       //div w html w którzym bedzie zawartość tej klasy

        thisHome.render(container);

    }

    render(container){
        const thisHome = this;

        /* generate HTML based on template */
        const generatedHTML = templates.homePage();

        /* create element using utils.createElementFromHTML */
        thisHome.elementDOM = utils.createDOMFromHTML(generatedHTML); //czym jest product.element, tworzymy ze string !prawdziwy element html!

        /* find page container */
        /* add element to page */
        container.appendChild(thisHome.elementDOM);//dodaj dziecko do elementu nowy html
    }
}

export default  Home;