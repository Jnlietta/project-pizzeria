

class BaseWidget {
    constructor(wrapperElement,initialValue){  //element dom w ktorym znajduje sie ten widget , poczatkowa wartosc widgetu
        const thisWidget = this;

        thisWidget.dom = {};
        thisWidget.dom.wrapper = wrapperElement;

        thisWidget.correctValue = initialValue;
    }

    get value(){ //getter - metoda wykonywana przy kazdej próbie odczytywania wartości właściwości 'value'
        const thisWidget = this;

        return thisWidget.correctValue;
    }

    set value(value){ //setter - metoda która jest wykonywana przy kazdej próbie ustawienia nowej wartosci właściwości 'value'
        const thisWidget = this;
  
        const newValue = thisWidget.parseValue(value);
        //console.log('newValue',newValue);
        //console.log('value',value);
        
        /* TODO: Add validation */
        if(thisWidget.correctValue!== newValue && thisWidget.isValid(newValue)){ //dlaczego jest taki operator  a nie != ??     /* dlaczego nie? :newValue!=null    / dlaczego nie Number.isNaN()?
        thisWidget.correctValue = newValue; // czy cos sie stanie jak zamienimy miejscami te rzeczy wzgledem znaku rowna sie?
        
        thisWidget.announce();
        }
  
        thisWidget.renderValue();
    }

    setValue(value){
        const thisWidget = this;

        thisWidget.value = value;
    }

    parseValue(value){
        return parseInt(value);
    }
  
    isValid(value){
        return !isNaN(value);
    }

    renderValue(){
        const thisWidget = this;
  
        thisWidget.dom.wrapper.innerHTML = thisWidget.value;

    }
      
    announce(){
        const thisWidget = this;
  
        //const event = new Event('updated');
        const event = new CustomEvent ('updated', {
          bubbles: true
        });
  
        thisWidget.dom.wrapper.dispatchEvent(event);
    }
}

export default BaseWidget;