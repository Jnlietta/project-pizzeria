import { classNames, select, settings, templates } from "../settings.js";
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
           //console.log(bookings);
           //console.log(eventsCurrent);
           //console.log(eventsRepeat);
           thisBooking.parseData(bookings,eventsCurrent,eventsRepeat);
        });

    }

    parseData(bookings,eventsCurrent,eventsRepeat){
        const thisBooking = this;

        thisBooking.booked = {};

        for (let item of bookings){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }
        for (let item of eventsCurrent){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        const minDate = thisBooking.datePicker.minDate;
        const maxDate = thisBooking.datePicker.maxDate;


        for (let item of eventsRepeat){
            if(item.repeat == 'daily'){ 
                for( let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
                    thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
                }
            }
        }

        console.log('thisBooking.booked', thisBooking.booked);

        thisBooking.updateDOM();
    }

    makeBooked(date, hour, duration, table){
        const thisBooking = this;

        if(typeof thisBooking.booked[date] == 'undefined'){
            thisBooking.booked[date] = {};
        }

        const startHour = utils.hourToNumber(hour);
    
        for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
            //console.log('loop',ourBlock);
            if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
                thisBooking.booked[date][hourBlock] = [];
            }
    
            thisBooking.booked[date][hourBlock].push(table);
        }
    }

    updateDOM(){
        const thisBooking = this;

        thisBooking.date = thisBooking.datePicker.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

        let allAvailable = false;

        if(
            typeof thisBooking.booked[thisBooking.date] == 'undefined'
            ||
            typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
        ){
            allAvailable = true;
        }

        for(let table of thisBooking.dom.tables){
            let tableId = table.getAttribute(settings.booking.tableIdAttribute);
            if(!isNaN(tableId)){
                tableId = parseInt(tableId);
            }

            if(
                !allAvailable
                &&
                thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) > -1
            ){
                table.classList.add(classNames.booking.tableBooked);
            } else {
                table.classList.remove(classNames.booking.tableBooked);
            }
        }
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

        thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

    }

    initWidgets(){
        const thisBooking = this;

        thisBooking.amountWidgetPeople = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.amountWidgetHours = new AmountWidget(thisBooking.dom.hoursAmount);

        thisBooking.dom.peopleAmount.addEventListener('updated', function(){
            
        });

        thisBooking.dom.hoursAmount.addEventListener('updated', function(){
            
        });

        thisBooking.datePicker = new DatePicker(thisBooking.dom.dateWrapper);
        thisBooking.hourPicker = new HourPicker(thisBooking.dom.timeWrapper);

        thisBooking.dom.wrapper.addEventListener('updated', function(){
            thisBooking.updateDOM();
        });
        thisBooking.dom.timeWrapper.addEventListener('updated', function(){

        });
    }
}


export default Booking;