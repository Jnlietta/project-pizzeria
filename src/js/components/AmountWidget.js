import { select, settings  } from "../settings.js";

class AmountWidget{
    constructor(element) {
      const thisWidget = this;

      //console.log('AmountWidget:', thisWidget);
      //console.log('constructor arguments:', element);

      thisWidget.getElements(element);
      
      //console.log('=========thisWidget.input.value',thisWidget.input.value);

      if(thisWidget.input.value){
      thisWidget.setValue(thisWidget.input.value);
      } else {
        thisWidget.setValue(settings.amountWidget.defaultValue);
      }

      thisWidget.initActions();
    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element; //referencja do diva zawierajacego buttony +- i input
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input); // referencja do taga input wyswietlajacy ilosc miedzy buttonami - i +
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease); //referencja do link buttona ktory zmniejsza ilosc
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease); //referencja do link buttona ktory zwieksza ilosc
    }

    setValue(value){
      const thisWidget = this;

      const newValue = parseInt(value);
      //console.log('newValue',newValue);
      //console.log('value',value);
      
      /* TODO: Add validation */
      if(thisWidget.value!== newValue && !isNaN(newValue) && 
      settings.amountWidget.defaultMax >= newValue && settings.amountWidget.defaultMin <= newValue){ //dlaczego jest taki operator  a nie != ??     /* dlaczego nie? :newValue!=null    / dlaczego nie Number.isNaN()?
      thisWidget.value = newValue; // czy cos sie stanie jak zamienimy miejscami te rzeczy wzgledem znaku rowna sie?
      
      thisWidget.announce();
      }

      thisWidget.input.value = thisWidget.value;
    }

    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }

    announce(){
      const thisWidget = this;

      //const event = new Event('updated');
      const event = new CustomEvent ('updated', {
        bubbles: true
      });

      thisWidget.element.dispatchEvent(event);
    }
  }

export default AmountWidget;