var Bluz = (function (){
    // variables ----------------------------------------------------------------
    var _this 		= {},
        _iframe		= null,
        a           = null;

    // initialize ---------------------------------------------------------------
    _this.init = function (){
        a = new myApi();
        _iframe = new IframeManager();
        _iframe.setListener(onMessage);

        a.get('btnDebug').addEventListener('click', toggleCookie);
        a.get('btnProfiler').addEventListener('click', toggleCookie);
    };

    // private functions ---------------------------------------------------------
    function onMessage (request){
        switch (request.message){
            case 'all-iframes-loaded': message_allIframesLoaded(request.data); break;
            case 'plugin-activate': message_pluginActivate(request.data); break;
            case 'cookie-add': message_cookieActivate(request.data); break;
        }
    }

    function toggleCookie(el) {
        el = el.toElement;
        if (el.hasClass('btn-danger')) {
            activeBtn(el);
            _iframe.tell('cookie-add', {"cookie": el.getAttribute('data-cookie')});
        } else {
            disableBtn(el);
            _iframe.tell('cookie-remove', {"cookie": el.getAttribute('data-cookie')});
        }
    }

    function changeStateBtn(data) {
        if (data.cookie.debug.active) {
            activeBtn(a.get('btnDebug'));
        } else {
            disableBtn(a.get('btnDebug'));
        }

        if (data.cookie.profiler.active) {
            activeBtn(a.get('btnProfiler'));
        } else {
            disableBtn(a.get('btnProfiler'));
        }
    }

    function activeBtn(el){
        el.setAttribute('class', 'btn btn-success');
        el.innerHTML = 'On';
    }

    function disableBtn(el){
        el.setAttribute('class', 'btn btn-danger');
        el.innerHTML = 'Off';
    }


    // messages -----------------------------------------------------------------
    function message_allIframesLoaded(data){
        //console.log('bluz received');
    }

    function message_pluginActivate (data){
        var params;
        params = (data.debugParams !== null) ? (data.debugParams.replace(new RegExp(';', 'g'), '<span></span>')) : '';

        a.get('bluzDebug').innerHTML = params;
        a.get('btnDebug').setAttribute('data-cookie', data.cookie.debug.name);
        a.get('btnProfiler').setAttribute('data-cookie', data.cookie.profiler.name);

        changeStateBtn(data);
        _iframe.tell('open-plugin', data);
    }

    return _this;
}());

document.addEventListener("DOMContentLoaded", function (){
  new Bluz.init(); }, false);
