var Popup = (function (){
	// variables ----------------------------------------------------------------
	var _this 		    = {},
		_background	    = null,
        _currPageUrl    = null,
        _pluginPosition = {},
        _btnActivate    = null,
        _COOKIE         = {},
        a               = null,
        regExprDomain   = new RegExp(/[a-zA-Z0-9](-*[a-zA-Z0-9]+)*(\.[a-zA-Z0-9](-*[a-zA-Z0-9]+)*)+/);

    // initialize ---------------------------------------------------------------
	_this.init = function (){
        a = new myApi();

        _background = chrome.extension.getBackgroundPage().Background;
        _currPageUrl = _background.getCurrentUrl().match(regExprDomain)[0];
        _btnActivate = a.get('btnActivatePlugin');

        // get previous settings
        chrome.storage.local.get('bluzSites', function(responce){
            //console.log(responce);
            _pluginPosition = responce.bluzSites;
            if(_pluginPosition[_currPageUrl]) {
                if (_pluginPosition[_currPageUrl].position == 'bottom') {
                    document.querySelector('.control-group input[value="bottom"]').setAttribute('checked', true);
                }
            }
        });


        checkStateBtn();
        _btnActivate.addEventListener('click', setActiveDebug);

        a.setEventOnClass('click', '.pull-left', saveSitePosition);
        a.get('currPage').innerHTML = _currPageUrl;
	};


	// private functions --------------------------------------------------------
    function checkStateBtn() {
        if (_background.getPluginState()) {
            _btnActivate.classList.remove('btn-danger');
            _btnActivate.classList.add('btn-success');
        }
    }

    function setActiveDebug(el){
        _background.activatePlugin();
        _btnActivate.classList.remove('btn-danger');
        _btnActivate.classList.add('btn-success');
        //_background.refreshPlugin();
    }

    function uncheckedRadio(){
        var elements = document.getElementsByTagName('input');
        for (var i in elements) {
            elements[i] instanceof Node && elements[i].removeAttribute('checked');
        }
    }

    function setNewCheck(el){
        var el = el.toElement;

        if (el.tagName == 'SPAN') {
            el = el.querySelector('input');
        }
        el.setAttribute('checked', 'true');
        return el;
    }

    function saveSitePosition(el){
        uncheckedRadio();
        var $el = setNewCheck(el);

        if (_currPageUrl) {
            if (typeof _pluginPosition == 'undefined') {_pluginPosition = {}}
            // save settings for current page
            _pluginPosition[_currPageUrl] = {"position": $el.getAttribute('value')};

            chrome.storage.local.set({'bluzSites': _pluginPosition}, function(result) {
                console.log('db > ', _pluginPosition);
            });
            console.log(_pluginPosition);
            _background.refreshPlugin();
        }
    }


    return _this;
}());

window.addEventListener("load", function() { new Popup.init(); }, false);