import { templates } from "../settings.js";
import utils from "../utils.js";


class Booking {
    constructor(container){
        const thisBooking =  this;
        
        thisBooking.element = container;

        thisBooking.render(container);
        //thisBooking.initWidgets();
    }

    render(container){
        const thisBooking = this;
        console.log(this);

        const generatedHTML = templates.bookingWidget();                     //nie wpisujemy danych w nawiasie bo nie potrzebujemy nic dodawac do tego szablonu-brak placeholderow
        console.log('generatedHTML',generatedHTML);

        thisBooking.dom = {};

        thisBooking.dom.wrapper = container;

        thisBooking.dom.wrapper.innerHTML = generatedHTML;      

        
    }

}


export default Booking;