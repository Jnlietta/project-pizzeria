import { classNames, select, settings, templates } from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";


class Booking {
    constructor(container){
        const thisBooking =  this;
        
        thisBooking.element = container;
        thisBooking.selectedTable = '';

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

        //console.log('thisBooking.booked', thisBooking.booked);

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
                thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
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
        thisBooking.dom.timeWrapper = container.querySelector(select.widgets.hourPicker.wrapper);

        thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
        thisBooking.dom.tablesWrapper = thisBooking.dom.wrapper.querySelector(select.booking.tablesWrapper);

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

        thisBooking.dom.tablesWrapper.addEventListener('click',  function(event){
            event.preventDefault();

            //reference to clicked element div DOM
            const clickedElement = event.target;
            //console.log('clickedElement',clickedElement);
            thisBooking.initTables(clickedElement);
        });
    }

    initTables(clickedTable){
        const thisBooking = this;

        //check if clicked table contain class 'table'
        if(clickedTable.classList.contains(classNames.booking.table)){
            //check if clicked table is available - doesn't contain class 'booked'
            if(!clickedTable.classList.contains(classNames.booking.tableBooked)){
                //console.log(clickedTable);

                if(!clickedTable.classList.contains(classNames.booking.tableSelected)){
                    //get attribute data-table from clicked table
                    const dataTable = clickedTable.getAttribute(settings.booking.tableIdAttribute);
                    
                    //add number of a table to selectedTable
                    thisBooking.selectedTable = dataTable;
                    //console.log('selectedTable', thisBooking.selectedTable);

                    //check if there is another table with class 'selected', if yes remove this class from it and add to clicked table
                    for(const child of clickedTable.offsetParent.children){
                        //console.log('child',child);

                        const selectedChild = child.classList.contains(classNames.booking.tableSelected);
                        //console.log('child with class selected',selectedChild);
                                        
                        if(selectedChild){ 
                            //remove class selected
                            child.classList.remove(classNames.booking.tableSelected);                        
                        }                    
                    }                    
                        //add class 'selected' to clicked table
                        clickedTable.classList.add(classNames.booking.tableSelected);
                } else {
                    //remove class 'selected' to clicked table
                    clickedTable.classList.remove(classNames.booking.tableSelected);

                    //clear the selectedTable
                    thisBooking.selectedTable = '';
                }
            } else {
                window.alert("Stolik zajety!");
                console.log('Stolik zajety!');
            }
        }
        console.log('selectedTable after all', thisBooking.selectedTable)


    }
}


export default Booking;