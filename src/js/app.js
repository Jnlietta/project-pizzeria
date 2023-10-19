import { settings, select, classNames } from "./settings.js";
import Product from "./components/Product.js";
import Cart from "./components/Cart.js";


  const app = {
    initPages: function(){
      const thisApp = this;
      console.log('thisApp:',thisApp);

      thisApp.pages = document.querySelector(select.containerOf.pages).children;  //.children to wbudowana metoda elementu DOM mozna to wyczytac z konsoli tak jak .id
      thisApp.navLinks = document.querySelectorAll(select.nav.links);

      thisApp.activatePage(thisApp.pages[0].id);

      for(let link of thisApp.navLinks){
        link.addEventListener('click', function(event){
          const clickedElement = this;
          event.preventDefault();

          /* get page id from href attribute */
          const id = clickedElement.getAttribute('href').replace('#', '');  //replace jest po to by zamienic np. '#order' na 'order'

          /* run thisApp.activatePage with that id */
          thisApp.activatePage(id);
        });
      }
    },

    activatePage: function(pageId){
      const thisApp = this;

      /* add class 'active' to matching pages, remove from non-matching */
      for(let page of thisApp.pages){

        // if(page.id == pageId){
        //   page.classList.add(classNames.pages.active);
        // } else {
        //   page.classList.remove(classNames.pages.active);
        // }                                                                   // w tym przypadku, linijka z toggle wystarczy i znaczy to samo co zakomentowane linijki

        page.classList.toggle(classNames.pages.active, page.id == pageId);
      }

      /* add class 'active' to matching links, remove from non-matching */
      for(let link of thisApp.navLinks){
        link.classList.toggle(                                                 //.toogle jako pierwszy argument przyjmuje nazwe klasy, a jako drugi przyjmuje warunek czyli mozna stosowac zamiast if
          classNames.nav.active, 
          link.getAttribute('href') == '#' + pageId
          );
      }
    },

    initMenu: function(){
      const thisApp = this;
      // console.log('thisApp.data:',thisApp.data);

      //const testProduct = new Product();
      //console.log('testProduct:',testProduct);
      for(let productData in thisApp.data.products){
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = {};

      const url = settings.db.url + '/' + settings.db.products;

      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          console.log('initData parsedResponse', parsedResponse);

          /*save parsedResponse as thisApp.data.products*/
          thisApp.data.products = parsedResponse;

          /*execute initMenu method */
          thisApp.initMenu();
        });
      
      console.log('thisApp.data', JSON.stringify(thisApp.data));
    },

    init: function(){
      const thisApp = this;
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);

      thisApp.initPages();

      thisApp.initData();
      //thisApp.initMenu(); skasowane dla serwera i przeniesione do initData, poniewaz uruchamialaby sie zanim nasz skrypt otrzymalby z serwera liste produktow
      thisApp.initCart();
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);

      thisApp.productList = document.querySelector(select.containerOf.menu);

      thisApp.productList.addEventListener('add-to-cart', function(event){
        app.cart.add(event.detail.product);
      });

      thisApp.productList.addEventListener('clear-menu-products', function(){
        app.initMenu();
      });
    },
  };

  app.init();

