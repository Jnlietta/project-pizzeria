import { select  } from "../settings.js";
import AmountWidget from "./AmountWidget.js";

class CartProduct{
    constructor(menuProduct, element){  //productSummary, generatedDOM
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.params = menuProduct.params;

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();

      //console.log('thisCartProduct',thisCartProduct);
    }

    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element; //generatedDOM (szablon z danymi productSummary jako DOM) // <li> zawierajace widger nazwe cene i ikony edycji lub usuniecia dla produktu na liscie wybranych produktow
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

    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent ('remove', {
        bubbles:true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);

      //console.log('wywolana');
    }

    initActions(){
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault();
      });

      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();

        thisCartProduct.remove();
      });
    }

    getData(){
      const thisCartProduct = this;

      //ma byc zwrocony nowy obiekt ktory z thisCartProduct bedzie zawieral tylko te wlasciwosci: id  amount price priceSingle name params
      const cartProductSummary = {};
      cartProductSummary.id = thisCartProduct.id;
      cartProductSummary.name = thisCartProduct.name;
      cartProductSummary.amount = thisCartProduct.amount;
      cartProductSummary.price = thisCartProduct.price;
      cartProductSummary.priceSingle = thisCartProduct.priceSingle;
      cartProductSummary.params = thisCartProduct.params;

      console.log('cartProductSummary',cartProductSummary);

      return cartProductSummary;
    }
  }

  export default CartProduct;