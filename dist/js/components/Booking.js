import { select, templates } from "../settings.js";
//import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";


class Booking {
    constructor(container){
        const thisBooking =  this;
        
        thisBooking.element = container;

        thisBooking.render(container);
        thisBooking.initWidgets();
    }

    render(container){
        const thisBooking = this;
        console.log(this);

        const generatedHTML = templates.bookingWidget();                     //nie wpisujemy danych w nawiasie bo nie potrzebujemy nic dodawac do tego szablonu-brak placeholderow
        //console.log('generatedHTML',generatedHTML);

        thisBooking.dom = {};

        thisBooking.dom.wrapper = container;
        
        thisBooking.dom.wrapper.innerHTML = generatedHTML;  
        
        thisBooking.dom.peopleAmount = container.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = container.querySelector(select.booking.hoursAmount);
        thisBooking.dom.dateWrapper = container.querySelector(select.widgets.datePicker.wrapper);
        //thisBooking.dom.dateInput = container.querySelector(select.widgets.datePicker.input);
        thisBooking.dom.timeWrapper = container.querySelector(select.widgets.hourPicker.wrapper);
        //thisBooking.dom.timeInput = container.querySelector(select.widgets.hourPicker.input);
        //thisBooking.dom.timeOutput = container.querySelector(select.widgets.hourPicker.output);


    }

    initWidgets(){
        const thisBooking = this;

        thisBooking.amountWidgetPeople = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.amountWidgetHours = new AmountWidget(thisBooking.dom.hoursAmount);

        thisBooking.dom.peopleAmount.addEventListener('updated', function(){
            
        });

        thisBooking.dom.hoursAmount.addEventListener('updated', function(){
            
        });

        thisBooking.datePickerWidget = new DatePicker(thisBooking.dom.dateWrapper);
        thisBooking.hourPickerWidget = new HourPicker(thisBooking.dom.timeWrapper);

        thisBooking.dom.dateWrapper.addEventListener('updated', function(){

        });
        thisBooking.dom.timeWrapper.addEventListener('updated', function(){

        });
    }
}


export default Booking;