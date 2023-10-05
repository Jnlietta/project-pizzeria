/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };
  
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
      
       console.log('new Product:', thisProduct);
      // console.log('thisProduct.form',thisProduct.form);
      // console.log('thisProduct.formInputs',thisProduct.formInputs);
    }

    renderInMenu(){
      const thisProduct = this;

      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);  //string szablonu z danymi thisproduct.data

      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML); //czym jest product.element, tworzymy ze string !prawdziwy element html!

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);//dodaj dziecko do elementu nowy html
    }

    getElements(){
      const thisProduct = this;
    //?????czy to sa referencje? TAK
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs); //czemu to jest all? bo mamy np w pizzy kilka takich tagów w których możemy  wybierac opcje?
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
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
          // console.log('imageWrapper:',thisProduct.imageWrapper);

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
              if(formData[paramId] && formData[paramId].includes(optionId)){ 
              imgOfSelectedOption.classList.add(classNames.menuProduct.imageVisible);
              //console.log('====added class active to imgOfSelectedOption:', imgOfSelectedOption);
              }
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

      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;

    }

    initAmountWidget(){
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    }

  }

  class AmountWidget{
    constructor(element) {
      const thisWidget = this;

      console.log('AmountWidget:', thisWidget);
      console.log('constructor arguments:', element);

      thisWidget.getElements(element);
    }
    getElements(element){
      const thisWidget = this;

      thisWidget.element = element; //referencja do diva zawierajacego buttony +- i input
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input); // referencja do taga input wyswietlajacy ilosc miedzy buttonami - i +
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease); //referencja do link buttona ktory zmniejsza ilosc
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease); //referencja do link buttona ktory zwieksza ilosc

    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;
      // console.log('thisApp.data:',thisApp.data);

      //const testProduct = new Product();
      //console.log('testProduct:',testProduct);
      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
       console.log('settings:', settings);
      // console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
