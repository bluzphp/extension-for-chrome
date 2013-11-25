var Background = (function (){
    // variables ----------------------------------------------------------------
    var _this 		    = {},
        _debugParams    = null,
        _barParams      = {},
        _currPageUrl    = null,
        _currPosition   = null,
        a               = null,
        regExprDomain   = new RegExp(/[a-zA-Z0-9](-*[a-zA-Z0-9]+)*(\.[a-zA-Z0-9](-*[a-zA-Z0-9]+)*)+/);

    var COOKIE = {
        debug       : {"name": localStorage.cookie_debug || 'BLUZ_DEBUG', "active": false},
        profiler    : {"name": localStorage.cookie_profile || 'XDEBUG_PROFILE', "active": false}
    }

    var HEADERS = {
        consoleParam    : localStorage.headers_details || 'Bluz-Bar, Bluz-Notify',
        pageParam       : localStorage.header_bar || 'Bluz-Debug'

    }

    // initialize ---------------------------------------------------------------
    _this.init = function (){
        a = new myApi();

        // receive post messages from "inject.js" and any iframes
        chrome.extension.onRequest.addListener(onPostMessage);

        // manage when a user change tabs
        chrome.tabs.onActivated.addListener(onTabActivated);

        // manage when a headers received
        chrome.webRequest.onHeadersReceived.addListener(onHeadersReceived,
            {urls: ["http://*/*"]},["responseHeaders"]);
    };

    // private functions --------------------------------------------------------
    function processMessage (request){
        // process the request
        switch (request.message){
            case 'all-iframes-loaded': message_allIframesLoaded(request.data); break;
            case 'cookie-add': message_onCookieAdd(request.data); break;
            case 'cookie-remove': message_onCookieRemove(request.data); break;
        }
    };

    function updateCurrentTab (){
        chrome.tabs.getSelected(null, function (tab){
            _currPageUrl = tab.url;
            if (_currPageUrl.match(new RegExp('https?'))) { // disable this action for url = chrome://extensions/
                _this.setPositionPlugin();
            }
        })

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
    };

    function onTabActivated (){
        updateCurrentTab();
        _debugParams = null;
    };

    function onHeadersReceived(details){
        if (details.type == 'main_frame' || details.type == 'xmlhttprequest') {
            details.responseHeaders.forEach(function(val){ console.log(val.name);
                if (val.name == HEADERS.pageParam) {
                    _debugParams = val.value;
                }

                if (HEADERS.consoleParam.indexOf(val.name) > -1) {
                    _barParams[val.name] = val.value;
                }
            });

            if (details.type == 'xmlhttprequest') {
                _this.tell('open-details', { barParams: _barParams, source: 'bluz'});
                _barParams = {};
            }
        }
    }

    function changeStateBtn() {
        chrome.cookies.get({"url": _currPageUrl, "name": COOKIE.debug.name}, function(cookie) {
            COOKIE.debug.active = !a.isEmpty(cookie);
        })

        chrome.cookies.get({"url": _currPageUrl, "name": COOKIE.profiler.name}, function(cookie) {
            COOKIE.profiler.active = !a.isEmpty(cookie);
        })

    }

    // messages -----------------------------------------------------------------
    function message_allIframesLoaded (data){
        updateCurrentTab();
    };

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
            if (nameCookie == COOKIE.debug.name) {
                COOKIE.debug.active = false;
                _this.tell('plugin-close');
            } else {
                COOKIE.profiler.active = false;
            }
        })
    }

    _this.addCookie = function(nameCookie) {
        chrome.cookies.set({"url": _currPageUrl, "name" : nameCookie, "value" : "1"}, function(cookie) {
            if (nameCookie == COOKIE.debug.name) {
                COOKIE.debug.active = true;
            } else {
                COOKIE.profiler.active = true;
            }
            console.log('successfully add cookie' + cookie);
        })
    }

    _this.getPluginState = function(){
        return COOKIE.debug.active;
    }

    _this.activatePlugin = function(){
        _this.addCookie(COOKIE.debug.name);
        _this.tell(
            'plugin-activate',
            {
                view:'*',
                debugParams: _debugParams,
                cookie : COOKIE,
                position : _currPosition
            }
        );
    }

    _this.getCurrentUrl = function() {
        return _currPageUrl;
    }

    _this.setPositionPlugin = function() {
        chrome.storage.local.get('bluzSites', function(responce){
            var domain = _currPageUrl.match(regExprDomain)[0];
            _currPosition = "top";
            if (responce.bluzSites[domain]){
                _currPosition = responce.bluzSites[domain].position;
            }

            changeStateBtn();
            if (COOKIE.debug.active) {
                _this.tell(
                    'plugin-activate',
                    {view:'*', debugParams: _debugParams, cookie : COOKIE, position : _currPosition, barParams: _barParams}
                );
                _barParams = {};
            }

        });
    }

    _this.refreshPlugin = function(){
        updateCurrentTab();
    }


    return _this;
}());

window.addEventListener("load", function() { Background.init(); }, false);