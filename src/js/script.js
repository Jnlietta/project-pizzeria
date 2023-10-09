/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
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
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };
  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };
  
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
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
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);//dodaj dziecko do elementu nowy html
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

      app.cart.add(thisProduct.prepareCartProduct());

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
           
            params[paramId] = {
              label:  param.label,
              options: { 
                [optionId]: option.label
              }
            }

            //params[paramId].options = [optionId].option[label];    Dlaczego taka linijka nie dziala? wyskakuje blad ze nie znamy label
            
            
          } 
        }
      }
      return params;
    }
  }

  class AmountWidget{
    constructor(element) {
      const thisWidget = this;

      //console.log('AmountWidget:', thisWidget);
      //console.log('constructor arguments:', element);

      thisWidget.getElements(element);

      if(thisWidget.input.value==null){
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

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();

      //console.log('new Cart',thisCart);
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element; //div o id=cart zawierajacy caly koszyk 
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList); //ul z class=cart_order-summary gdzie bedzie lista produktow z koszyka
    }

    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }

    add(menuProduct){
      const thisCart = this;

      //console.log('adding product', menuProduct); // productSummary

      const generatedHTML = templates.cartProduct(menuProduct);

      const generatedDOM = utils.createDOMFromHTML(generatedHTML);     //to jest nadpisywane kazdym kolejnym produktem dodanym do koszyka 

      const cartContainer = thisCart.dom.productList;

      cartContainer.appendChild(generatedDOM);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      //console.log('thisCart.products:',thisCart.products);

      //thisCart.cartProduct = new CartProduct(menuProduct, thisCart.element);  
    }
  }

  class CartProduct{
    constructor(menuProduct, element){
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.params = menuProduct.params;

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();

      //console.log('thisCartProduct',thisCartProduct);
    }

    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);

    }

    initAmountWidget(){
      const thisCartProduct = this;
      thisCartProduct.amountWidgetElem = new AmountWidget(thisCartProduct.dom.amountWidget);
      //console.log('thisCartProduct.amountWidgetElem:', thisCartProduct.amountWidgetElem);

      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
        thisCartProduct.amount = thisCartProduct.amountWidgetElem.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
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
      // console.log('settings:', settings);
      // console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
  };

  app.init();
}
