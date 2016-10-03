var Background = (function (){
    // variables ----------------------------------------------------------------
    var _this 		    = {},
        _debugParams    = null,
        _barParams      = {},
        _currPageUrl    = null,
        _currDomain     = null,
        _websites       = [],
        _arrPageParams  = [],
        a               = null,
        COOKIE          = {},
        regExprDomain   = new RegExp(/[a-zA-Z0-9](-*[a-zA-Z0-9]+)*(\.[a-zA-Z0-9](-*[a-zA-Z0-9]+)*)+/);
    var ports = [];
    var openCount = 0;

    // initialize ---------------------------------------------------------------
    _this.init = function (){
        COOKIE = {
            debug       : {"name": localStorage.cookie_debug || 'BLUZ_DEBUG', "active": false},
            profiler    : {"name": localStorage.cookie_profile || 'XDEBUG_PROFILE', "active": false}
        };

        a = new myApi();

        // receive post messages from "inject.js" and any iframes
        chrome.extension.onRequest.addListener(onPostMessage);

        // manage when a user change tabs
        chrome.tabs.onActivated.addListener(onTabActivated);
        chrome.tabs.onUpdated.addListener(changeStateBtn);

        // manage when a headers received
        chrome.webRequest.onHeadersReceived.addListener(onHeadersReceived,
            {urls: ["http://*/*"]},["responseHeaders"]);

        chrome.browserAction.onClicked.addListener(onPopupClicked);

        chrome.runtime.onConnect.addListener(function(port) {
            if (port.name !== "devtools") return;
            ports.push(port);
            // Remove port when destroyed (eg when devtools instance is closed)
            port.onDisconnect.addListener(function() {
                var i = ports.indexOf(port);
                if (i !== -1) ports.splice(i, 1);
            });
            port.onMessage.addListener(function(msg) {
              if (msg === 'btnDebug-addCookie') {
                _this.addCookie(COOKIE.debug.name);
              }
              if (msg === 'btnDebug-removeCookie') {
                _this.removeCookie(COOKIE.debug.name);
                chrome.storage.sync.set({
                  debugText: ''
                })
              }
              if (msg === 'btnProfiler-addCookie') {
                _this.addCookie(COOKIE.profiler.name);
              }
              if (msg === 'btnProfiler-removeCookie') {
                _this.removeCookie(COOKIE.profiler.name);
              }
            });
        });

        chrome.runtime.onConnect.addListener(function (port) {
            if (port.name == "devtools") {
              if (openCount == 0) {
                console.log(_barParams);
                chrome.storage.sync.get(["debugText"], function(res) {
                  //if (res.debugText[0]) {
                    ports.forEach(function(port) {
                        port.postMessage({
                          debugText: res.debugText,
                          debug: COOKIE.debug.active,
                          profiler: COOKIE.profiler.active,
                          barParams: _barParams
                        });
                    });
                  /*} else {
                    ports.forEach(function(port) {
                      res.debugText[0] = 'Sorry, debug files not found!';
                        port.postMessage(res.debugText);
                    });
                  }*/
                })
              }
              openCount++;

              port.onDisconnect.addListener(function(port) {
                  openCount--;
                  if (openCount == 0) {
                    console.log("Last DevTools window closing.");
                  }
              });
            }
        });
    };

    // private functions --------------------------------------------------------
    function processMessage (request){
        // process the request
        switch (request.message){
            case 'all-iframes-loaded': message_allIframesLoaded(request.data); break;
            case 'cookie-add': message_onCookieAdd(request.data); break;
            case 'cookie-remove': message_onCookieRemove(request.data); break;
        }
    }

    function updateCurrentTab (){
        chrome.tabs.getSelected(null, function (tab){
            _currPageUrl = tab.url;

            if (_currPageUrl.match(new RegExp('https?'))) { // disable this action for url = chrome://extensions/
                changeStateBtn();
                if (COOKIE.debug.active) {
                    _currDomain = _currPageUrl.match(regExprDomain);
                    if (_currDomain !== null) {
                      _currDomain = _currPageUrl.match(regExprDomain)[0];
                    }
                    tellActivatePlugin();
                } else {
                    _this.tell('plugin-close');
                }

                if (!_currPageUrl.match(new RegExp('bookmarks$'))) {
                  chrome.tabs.query({currentWindow: true, active: true}, function (tab) {
                    chrome.tabs.executeScript(tab[0].id, {
                      file: "./js/content_script.js",
                      runAt: "document_start"
                    });
                  });
                }
            }
        })
    }

    function changeStateBtn(tabId, changeInfo, tab) {
        chrome.cookies.get({"url": _currPageUrl, "name": COOKIE.debug.name}, function(cookie) {
            COOKIE.debug.active = !a.isEmpty(cookie);
        })

        chrome.cookies.get({"url": _currPageUrl, "name": COOKIE.profiler.name}, function(cookie) {
            COOKIE.profiler.active = !a.isEmpty(cookie);
        })

        if (changeInfo) {
          if (changeInfo.status === 'complete') {
            ports.forEach(function(port) {
                port.postMessage({message: 'reloadPage'});
            });
          }
        }
    }

    function tellActivatePlugin(){
      console.log(_barParams);
        _this.tell(
            'plugin-activate',
            {view:'*', debugParams: _arrPageParams[_currPageUrl], cookie : COOKIE, barParams: _barParams || {}}
        );
        _barParams = {};
    }

    // events -------------------------------------------------------------------
    function onPostMessage (request, sender, sendResponse){
        if (!request.message) return;

        // if it has a "view", it resends the message to all the frames in the current tab
        if (request.data.view){
            _this.tell(request.message, request.data);
            return;
        }

        processMessage(request);
    }

    function onTabActivated (){
        updateCurrentTab();
        _debugParams = null;
    }

    function onHeadersReceived(details){
        var headersParam = {
            consoleParam    : localStorage.headers_details || 'Bluz-Bar, Bluz-Notify',
            pageParam       : localStorage.headers_bar || 'Bluz-Debug'

        };

        if (details.type == 'main_frame' || details.type == 'xmlhttprequest') {
            details.responseHeaders.forEach(function(val){
                if (val.name == headersParam.pageParam) {
                    _debugParams = val.value;
                    _arrPageParams[details.url] = _debugParams;
                }

                if (headersParam.consoleParam.indexOf(val.name) > -1) {
                    _barParams[val.name] = val.value;
                }
            });

            if (details.type == 'xmlhttprequest') {
                _this.tell('open-details', { barParams: _barParams, source: 'bluz'});
                _barParams = {};
            }
        }
    }

    function onPopupClicked(tab) {
        if (typeof _websites[_currDomain] == 'undefined' || _websites[_currDomain].status == 'hide') {
            _this.activatePlugin();
        } else {
            _this.removeCookie(COOKIE.debug.name);
        }
    }

    // messages -----------------------------------------------------------------
    function message_allIframesLoaded (data){
        updateCurrentTab();
    }

    function message_onCookieAdd(data){
        _this.addCookie(data.cookie);
    }

    function message_onCookieRemove(data){
        _this.removeCookie(data.cookie);

    }

    // public functions ---------------------------------------------------------
    _this.tell = function (message, data){
        var data = data || {};

        // find the current tab and send a message to "inject.js" and all the iframes
        chrome.tabs.getSelected(null, function (tab){
            if (!tab) return;

            chrome.tabs.sendMessage(tab.id, {
                message	: message,
                data	: data
            });
        });
    };

    _this.removeCookie = function(nameCookie) {
        chrome.cookies.remove({"url": _currPageUrl, "name" : nameCookie}, function(cookie) {
            console.log('successfuly remove cookie' + cookie);
            _websites[_currDomain] = {status: 'hide'};
            if (nameCookie == COOKIE.debug.name) {
                COOKIE.debug.active = false;
                chrome.storage.sync.set({
                  debug: false
                })
                _this.tell('plugin-close');
            } else {
                COOKIE.profiler.active = false;
                chrome.storage.sync.set({
                  profiler: false
                })
            }
        })
    };

    _this.addCookie = function(nameCookie) {
        //_this.removeCookie(nameCookie);
        chrome.cookies.set({"url": _currPageUrl, "name" : nameCookie, "value" : "1"}, function(cookie) {
            _websites[_currDomain] = {status: 'show'};
            if (nameCookie == COOKIE.debug.name) {
                COOKIE.debug.active = true;
                chrome.storage.sync.set({
                  debug: true
                })
            } else {
                COOKIE.profiler.active = true;
                chrome.storage.sync.set({
                  profiler: true
                })
            }
            console.log('successfully add cookie' + cookie);
        })
    };

    _this.getPluginState = function(){
        return COOKIE.debug.active;
    };

    _this.activatePlugin = function(){
        chrome.storage.local.set({'bluzSite': _websites}, function() {
            _this.addCookie(COOKIE.debug.name);
            tellActivatePlugin();
        })
    };

    _this.getCurrentUrl = function() {
        return _currPageUrl;
    };

    _this.refreshPlugin = function(){
        updateCurrentTab();
    };


    return _this;
}());

window.addEventListener("load", function() { Background.init(); }, false);
