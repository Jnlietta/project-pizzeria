import { select, settings, classNames, templates } from "../settings.js";
import utils from "../utils.js";
import CartProduct from "./CartProduct.js";

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
    
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee); //miejsce ceny dostawy w koszyku DOM
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);

      //console.log('thisCart.dom.totalPrice',thisCart.dom.totalPrice);

      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
      
    }

    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('remove', function(event){
        thisCart.remove(event.detail.cartProduct); //thisCartProduct jest argumentem
      });

      thisCart.dom.form.addEventListener('submit', function(event){
        event.preventDefault();

        thisCart.sendOrder();
        //thisCart.clearProductList(); mam wywołać tą funkcję w fetch w sendOrder, ponieważ: "Poki request nie zakończy, nie masz bowiem pewności, czy wysyłka się udała. A skoro tak, to raczej nie powinnismy oszukiwac uzytkonwika, ze niby wszystko sie udalo"
      });
    }

    add(menuProduct){
      const thisCart = this;

      //console.log('adding product', menuProduct); // productSummary

      const generatedHTML = templates.cartProduct(menuProduct);   //szablon wybranego produktu z wstawionymi danymi od productSummary w postaci kodu html
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);  //?? //szablon z danymi productSummary zamieniony na element DOM //to jest nadpisywane kazdym kolejnym produktem dodanym do koszyka 

      const cartContainer = thisCart.dom.productList;

      cartContainer.appendChild(generatedDOM); // wstawienie szablonu DOM w odpowiednie miejsce w html

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      console.log('thisCart.products:',thisCart.products);

      //thisCart.cartProduct = new CartProduct(menuProduct, thisCart.element);  

      thisCart.update();
    }

    update(){
      const thisCart = this;

      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;

      for (let productCart of thisCart.products){
        thisCart.totalNumber += productCart.amount;
        thisCart.subtotalPrice += productCart.price;
      }

      //console.log('totalNumber:',thisCart.totalNumber);
      //console.log('subtotalPrice:',thisCart.subtotalPrice);

      if(thisCart.totalNumber!=0){
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

      } else {
        thisCart.totalPrice = 0;
      }

      //console.log('totalPrice:',thisCart.totalPrice);

      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;

      for(let price of thisCart.dom.totalPrice){ 
        price.innerHTML = thisCart.totalPrice;
      }

      
    }

    remove(CartProductInstance){ //thisCartProduct
      const thisCart = this;

      //console.log('CartProductInstance',CartProductInstance);

      //remove product from DOM html
      CartProductInstance.dom.wrapper.remove();

      //remove informations about this product from array thisCart.products
      const indexOfInstance = thisCart.products.indexOf(CartProductInstance);
      //console.log('index',indexOfInstance);
      thisCart.products.splice(indexOfInstance, 1);

      //call the method update to recalculate amounts after product remove 
      thisCart.update();
    }

    sendOrder(){
      const thisCart = this;

      const url = settings.db.url + '/' + settings.db.orders;

      const payload = {
        address: thisCart.dom.address.value, //adres klienta wpisany w koszyku,      DLACZEGO DODANIE PO KROPCE VALUE DZIALA NA ODCZYTYWANIE INPUTU SKORO TO NIE OBIEKT A ELEMENT DOM??
        phone: thisCart.dom.phone.value, //numer telefonu wpisany w koszyku,
        totalPrice: thisCart.totalPrice, //calkowita cena za zamowienie,
        subtotalPrice: thisCart.subtotalPrice, //cena calkowita - koszt dostawy,
        totalNumber: thisCart.totalNumber, //calkowita liczba sztuk,
        deliveryFee: thisCart.deliveryFee, //koszt dostawy,
        products: [] //tablica obecnych w koszyku produktow
      };

      for(let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }

      console.log('payload',payload);

      const options = {
        method:'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      };

      fetch(url, options)
        .then(function(response){
          return response.json();
        }) .then(function(parsedResponse){
          console.log('sendOrder parsedResponse',parsedResponse);
          thisCart.clearProductList();
        });    

    }

    clearProductList(){ //dla chetnych
      const thisCart = this;

      //remove all products from Cart list
      thisCart.products.splice(0,thisCart.totalNumber);

      console.log('thisCart.products after click "ORDER":',thisCart.products);

      thisCart.dom.productList.innerHTML = '';
      thisCart.dom.address.value = '';
      thisCart.dom.phone.value = '';
      thisCart.update();

    }
  }

export default Cart;