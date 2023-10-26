import { settings, select, classNames } from "./settings.js";
import Product from "./components/Product.js";
import Cart from "./components/Cart.js";
import Booking from "./components/Booking.js";
import Home from "./components/Home.js";


  const app = {
    init: function(){
      const thisApp = this;
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);
      thisApp.initPages();
      thisApp.initHome();
      thisApp.initPages();
      thisApp.initData();
      //thisApp.initMenu(); skasowane dla serwera i przeniesione do initData, poniewaz uruchamialaby sie zanim nasz skrypt otrzymalby z serwera liste produktow
      thisApp.initCart();
      thisApp.initBooking();
    },
    
    initPages: function(){
      const thisApp = this;
      //console.log('thisApp:',thisApp);

      thisApp.pages = document.querySelector(select.containerOf.pages).children;  //.children to wbudowana metoda elementu DOM mozna to wyczytac z konsoli tak jak .id
      thisApp.navLinks = document.querySelectorAll(select.nav.links);
      //console.log(thisApp.navLinks);

      const idFromHash = window.location.hash.replace('#/', '');
      //console.log('idFromHash',idFromHash);

      let pageMatchingHash = thisApp.pages[0].id;

      for(let page of thisApp.pages){
        if(page.id == idFromHash){
          pageMatchingHash = page.id;
          break;
        }
      }
      
      //console.log('pageMatchingHash',pageMatchingHash);

      //thisApp.activatePage(thisApp.pages[0].id);                                  //musimy zmienic id z argumentu na id wziete z url strony bez "#/"
      thisApp.activatePage(pageMatchingHash);

      for(let link of thisApp.navLinks){
        link.addEventListener('click', function(event){
          const clickedElement = this;
          event.preventDefault();

          /* get page id from href attribute */
          const id = clickedElement.getAttribute('href').replace('#', '');  //replace jest po to by zamienic np. '#order' na 'order'

          /* run thisApp.activatePage with that id */
          thisApp.activatePage(id);

          /* change URL hash */
          window.location.hash = '#/' + id;                                    //ta linijka dodaje w adresie URL koncówke zaczynajaca sie od # efekt np. "http://localhost:3002/#order" -> "http://localhost:3002/#booking"
        });                                                                    // dodalismy '/' by strona nie przewijała nam sie do elementu o tym id co koncowka url     
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

    initBooking(){
      const thisApp = this;

      thisApp.bookingContainer = document.querySelector(select.containerOf.booking);

      thisApp.booking = new Booking (thisApp.bookingContainer);
    },

    initHome(){
      const thisApp = this;

      thisApp.homeContainer = document.querySelector(select.containerOf.home);

      thisApp.home = new Home (thisApp.homeContainer);
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
          //console.log('initData parsedResponse', parsedResponse);

          /*save parsedResponse as thisApp.data.products*/
          thisApp.data.products = parsedResponse;

          /*execute initMenu method */
          thisApp.initMenu();
        });
      
      //console.log('thisApp.data', JSON.stringify(thisApp.data));
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

