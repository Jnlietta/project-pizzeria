import { select, settings, templates } from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";


class Booking {
    constructor(container){
        const thisBooking =  this;
        
        thisBooking.element = container;

        thisBooking.render(container);
        thisBooking.initWidgets();
        thisBooking.getData();

    }

    getData(){
        const thisBooking = this;

const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);


        const params = {
            booking: [
                startDateParam,
                endDateParam,
            ],
            eventsCurrent: [
                settings.db.notRepeatParam,
                startDateParam,
                endDateParam,
            ],
            eventsRepeat: [
                settings.db.repeatParam,
                endDateParam,
            ],
        };

        //console.log('getData params',params);

        const urls = {
            booking:       settings.db.url + '/' + settings.db.bookings 
                                           + '?' + params.booking.join('&'),
            eventsCurrent: settings.db.url + '/' + settings.db.events   
                                           + '?' + params.eventsCurrent.join('&'),
            eventsRepeat:  settings.db.url + '/' + settings.db.events   
                                           + '?' + params.eventsRepeat.join('&'), 
  
            };

        //console.log('getData urls',urls);

        Promise.all([                                    //zadziała podobnie do fetch, tylko wykona zestaw operacji zawatych w tej tablicy
            fetch(urls.booking),                        //wykona pewna operacje a kiedy zostanie zakonczona wtedy zostanie wykonana funkcja zdefiniowana w metodzie then
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat),
        ]).then(function(allResponses){                  //allResponses to bedzie tablica zawierajaca odpowiedzi ze wszystkich fetchów
            const bookingsResponse = allResponses[0];
            const eventsCurrentResponse = allResponses[1];
            const eventsRepeatResponse = allResponses[2];

            return Promise.all ([
                bookingsResponse.json(),
                eventsCurrentResponse.json(),
                eventsRepeatResponse.json(),
            ]);
        }).then(function([bookings, eventsCurrent, eventsRepeat]){          //potraktuj pierwszy argument jako tablice i pierwszy element z tej tablicy zapisz w zmiennej bookings;                                            responses to rowniez tablica
           console.log(bookings);
           console.log(eventsCurrent);
           console.log(eventsRepeat);
        });

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
        //ooking()thisBooking.dom.dateInput = container.querySelector(select.widgets.datePicker.input);
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

        thisBooking.datePicker= new DatePicker(thisBooking.dom.dateWrapper);
        thisBooking.hourPicker = new HourPicker(thisBooking.dom.timeWrapper);

        thisBooking.dom.dateWrapper.addEventListener('updated', function(){

        });
        thisBooking.dom.timeWrapper.addEventListener('updated', function(){

        });
    }
}


export default Booking;