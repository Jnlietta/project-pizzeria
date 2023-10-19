import { select, settings  } from "../settings.js";
import BaseWidget from "./BaseWidget.js";

class AmountWidget extends BaseWidget{
    constructor(element) {
    super(element, settings.amountWidget.defaultValue); //super() = konstruktor klasy BaseWidget , element-pierwszy argument z konstruktora BaseWidget

      const thisWidget = this;

      //console.log('AmountWidget:', thisWidget);
      //console.log('constructor arguments:', element);

      thisWidget.getElements(element);
      
      //console.log('=========thisWidget.dom.input.value',thisWidget.dom.input.value);

      if(thisWidget.dom.input.value){
      thisWidget.setValue(thisWidget.dom.input.value);
      } else {
        thisWidget.setValue(settings.amountWidget.defaultValue);
      }

      thisWidget.initActions();
    }

    getElements(){
      const thisWidget = this;

      //usuwamy to bo w BaseWidget podajemy ta wartosc w 1 argumencie konstruktora: thisWidget.element = element; //referencja do diva zawierajacego buttony +- i input
      thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input); // referencja do taga input wyswietlajacy ilosc miedzy buttonami - i +
      thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease); //referencja do link buttona ktory zmniejsza ilosc
      thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease); //referencja do link buttona ktory zwieksza ilosc
    }

    isValid(value){
      return !isNaN(value)
      &&  value <= settings.amountWidget.defaultMax  
      &&  value >= settings.amountWidget.defaultMin;
    }

    renderValue(){
      const thisWidget = this;

      thisWidget.dom.input.value = thisWidget.value;

    }

    initActions(){
      const thisWidget = this;

      thisWidget.dom.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.dom.input.value);
      });

      thisWidget.dom.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.dom.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }
    
  }

export default AmountWidget;