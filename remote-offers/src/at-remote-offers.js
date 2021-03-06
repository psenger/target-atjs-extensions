 /* global adobe */
(function (window, document, at) {
  'use strict';
  var nanoajax = require('nanoajax');
  var logger;
  var offers;
  var observing = false;

  function unhideElements(hideCss) {
    if (hideCss && hideCss.parentNode) {
      hideCss.parentNode.removeChild(hideCss);
    }
  }

  function execHandler(name, handler) {
    if (typeof handler === 'function') {
      logger.log(name, 'handler');
      handler();
    }
  }

  function applyOffer(offer) {
    at.applyOffer({
      offer: [{
        type: 'actions',
        content: [{
          selector: offer.selector,
          content: offer.responseText,
          action: (offer.method ? offer.method : 'append') + 'Content'
        }]
      }]
    });
    execHandler('Success', offer.success);
    unhideElements(offer.hideCss);
    offer.applied = true;
    logger.log('Offer applied to ', offer.selector);
  }

  function onMutation(mutations) {
    offers
      .filter(function (offer) {
        return offer.fetched && !offer.applied;
      })
      .forEach(function (offer) {
        if (document.querySelectorAll(offer.selector).length) {
          applyOffer(offer);
        }
      });
  }

  function setupObserver() {
    observing = true;

    var timeout = 30000;
    var observerConfig = {
      childList: true,
      subtree: true
    };
    var observer = new window.MutationObserver(onMutation);

    observer.observe(document.documentElement, observerConfig);
    window.setTimeout(function () {
      logger.log('Observer timed out');
      observer.disconnect();
      offers.forEach(function (offer) {
        unhideElements(offer.hideCss);
      });
      observing = false;
    }, timeout);
  }

  // injecting CSS to hide containers
  function addHideCssToHead(selector) {
    var hideCss = selector + '{visibility:hidden}';
    var head = document.getElementsByTagName('head')[0];

    if (head) {
      var style = document.createElement('style');
      style.setAttribute('type', 'text/css');
      if (style.styleSheet) {
        style.styleSheet.cssText = hideCss;
      } else {
        style.appendChild(document.createTextNode(hideCss));
      }
      return head.insertBefore(style, head.firstChild);
    }
  }

  function fetchOffer(offer) {
    nanoajax.ajax({url: offer.url},
      function (code, responseText) {
        if (code === 200 && responseText) {
          offer.fetched = true;
          offer.responseText = responseText;
          if (document.querySelectorAll(offer.selector).length) {
            applyOffer(offer);
          } else if (!observing) {
            setupObserver();
          }
        } else {
          logger.error('Error loading content for', offer.url, ', status:', code);
          unhideElements(offer.hideCss);
          execHandler('Error', offer.error);
        }
      });
  }

  function fetchOffers() {
    offers
      .filter(function (offer) {
        if (!offer.url || !offer.selector) {
          logger.error('Missing URL or selector');
          return false;
        }
        return true;
      })
      .forEach(function (offer) {
        offer.hideCss = addHideCssToHead(offer.selector);
        offer.fetched = false;
        fetchOffer(offer);
      });
  }

  adobe.target.registerExtension({
    name: 'getRemoteOffers',
    modules: ['logger'],
    register: function (pLogger) {
      return function (data) {
        logger = pLogger;
        offers = data;
        fetchOffers();
      };
    }
  });
})(window, document, adobe.target);
