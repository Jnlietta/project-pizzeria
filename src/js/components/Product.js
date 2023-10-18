import { select, classNames, templates } from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";

class Product{
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      
       //console.log('new Product:', thisProduct);
       //console.log('thisProduct.form',thisProduct.form);
       //console.log('thisProduct.formInputs',thisProduct.formInputs);
    }

    renderInMenu(){
      const thisProduct = this;

      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);  //string szablonu z danymi thisProduct.data

      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML); //czym jest product.element, tworzymy ze string !prawdziwy element html!

      /* find menu container */
      thisProduct.menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      thisProduct.menuContainer.appendChild(thisProduct.element);//dodaj dziecko do elementu nowy html
    }

    getElements(){
      const thisProduct = this;

      thisProduct.dom = {};
      //console.log('dom',thisProduct.dom);

    //?????czy to sa referencje? TAK
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs); //czemu to jest all? bo mamy np w pizzy kilka takich tagów w których możemy  wybierac opcje?
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);

      //console.log('thisProduct.cartButton',thisProduct.cartButton);
      //console.log('thisProduct.priceElem',thisProduct.priceElem);
      //console.log('thisProduct.amountWidgetElem',thisProduct.amountWidgetElem);
    }

    initAccordion(){
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */
    //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    // console.log('accordionTrigger',thisProduct.accordionTrigger);

    /* START: add event listener to clickable trigger on event click */
    thisProduct.accordionTrigger.addEventListener('click', function(event) {
      /* prevent default action for event */
      event.preventDefault();

      // console.log('thisProduct.element',thisProduct.element);
      // console.log('this',this);

      /* find active product (product that has active class) */
      const activeProduct = document.querySelector('.product.active'); //czemu wybieramy taką opcje skoro usunelismy klase aktive i czemu jak wpisywałam thisproduct.element to nie działało
      // console.log('activeProduct',activeProduct);

      /* if there is active product and it's not thisProduct.element, remove class active from it */
      if(activeProduct != null && activeProduct != thisProduct.element) {
        activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
      } else{
        // console.log('Brawo rozwijasz akordeon!');
      }
      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);  
    });
    }

    initOrderForm(){
      const thisProduct = this;

      // console.log('Nazwa metody: initOrderForm');

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();

        thisProduct.addToChart(); //dodanie tego produktu do koszyka
      });
    }

    processOrder(){
      const thisProduct = this;

      // console.log('Nazwa metody: processOrder');

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      // console.log('formData:',formData);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        // console.log(paramId, param);

        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          // console.log(optionId, option);

          // find img with class '.paramId-optionId' inside thisProduct.imageWrapper
          const classImage = '.' + paramId + '-' + optionId;

          // console.log('---------classImage', classImage);
           //console.log('imageWrapper:',thisProduct.imageWrapper);

          const imgOfSelectedOption = thisProduct.imageWrapper.querySelector(classImage);
          // console.log('==== imgOfSelectedOption:', imgOfSelectedOption);

          // check if optionId of category paramId is selected in form formData
          if(formData.hasOwnProperty(paramId) && formData[paramId].includes(optionId)) {
            // console.log('paramId istnieje w formData:',formData.hasOwnProperty(paramId));
            // console.log('optionId istnieje w paramId i nazywa się:', optionId);

            // chceck if option is not default                                        
            if(!option.default){
              //console.log('   option -',optionId,'- is not default');

              //add option price to price variable
              price += option.price;
            }         

            // check if image exist , if yes add class 'active' (classNames.menuProduct.imageVisible)
            if(imgOfSelectedOption != null ){
              imgOfSelectedOption.classList.add(classNames.menuProduct.imageVisible);
              //console.log('====added class active to imgOfSelectedOption:', imgOfSelectedOption);
              
            } 

          } else {
            //console.log(' - - - - nie ma tego optionId:', optionId);

            //check if the option is default
            if(option.default){
              //console.log('   option -',optionId,'- is default');

              // reduce price variable
              price -= option.price;
            }

            // check if image exist , if yes remove class 'active'
            if(imgOfSelectedOption != null ){
              imgOfSelectedOption.classList.remove(classNames.menuProduct.imageVisible);
                   
            } 
          }
        }
      }
      /* multiply price by amount */
      price *= thisProduct.amountWidget.value;

      //the single price after choosing product options (this amount above the button 'add to cart')
      thisProduct.priceSingle = price;

      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;

    }

    initAmountWidget(){
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    
      thisProduct.amountWidgetElem.addEventListener('updated', function() {
        thisProduct.processOrder();
      });
    }

    addToChart(){
      const thisProduct = this;

      //app.cart.add(thisProduct.prepareCartProduct());
      const event = new CustomEvent('add-to-cart', {
        bubbles: true,
        detail: {
          product: thisProduct.prepareCartProduct(),
        },
      }
      );
      thisProduct.element.dispatchEvent(event);

      thisProduct.clearMenuProducts();
    }

    prepareCartProduct(){
      const thisProduct = this;

      const productSummary = {};
      productSummary.id = thisProduct.id;
      productSummary.name = thisProduct.data.name;
      productSummary.amount = thisProduct.amountWidget.value;
      productSummary.price = thisProduct.priceSingle; //to powinna byc cena za 1 produkt z opcjami ale jesli klient od razu doda dwa takie produkty to bedzie cena podwojna a nie jednostkowa za ten produkt, wiec zamienilam te price i priceSingle alby odpowiaday temu czego szukamy
      productSummary.priceSingle = productSummary.price / productSummary.amount;
      productSummary.params = thisProduct.prepareCartProductParams();


      //console.log('productSummary',productSummary);

      return productSummary; 

    }

    prepareCartProductParams(){
      const thisProduct = this;

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      // console.log('formData:',formData);

      //new object params
      const params = {};

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
         //console.log(paramId, param);

         //create category param in params const eg. params = {ingredients: {name: 'Ingridients', options: {}}}
         params[paramId] = {
            label:  param.label,
            options: {}
         }

        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          // console.log(optionId, option);
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].includes(optionId);
          

          // check if optionId of category paramId is selected in form formData
          if(optionSelected) {
           
            /*params[paramId] = {
              label:  param.label,
              options: { 
                [optionId]: option.label
              }
            }*/

            //params[paramId].options = [optionId].option[label];    Dlaczego taka linijka nie dziala? wyskakuje blad ze nie znamy label
            
            params[paramId].options[optionId] = option.label;
            
          } 
        }
      }
      return params;
    }

    clearMenuProducts(){ //dla chetnych
      const thisProduct = this;

      //clear products and init default menu 
      thisProduct.menuContainer.innerHTML = '';

      const event = new CustomEvent('clear-menu-products', {
        bubbles: true,
      }
      );
      thisProduct.element.dispatchEvent(event);

      // app.initMenu();
      // console.log('thisProduct.data',thisProduct.data);
      // console.log('app data products:',app.data.products);

    }
  }

export default Product;