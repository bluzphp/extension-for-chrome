var myApi = function (){
    var _this 		= {};

    _this.init = function(){

        Element.prototype.hasClass = function(className) {
            return this.className && new RegExp("(^|\\s)" + className + "(\\s|$)").test(this.className);
        };
    }

    _this.get = function(idName) {
        return document.getElementById(idName);
    }


    _this.setEventOnClass = function(eventName, className, callbackFunction) {
        var elements = document.querySelectorAll(className);
        for(var i in elements) {
            if(elements.hasOwnProperty(i)){
                var node = elements[i];
                node instanceof Node && node.addEventListener(eventName, callbackFunction);
            }
        }
    },
    _this.isEmpty = function(obj) {
        if (obj == null) return true;
        if (obj.length && obj.length > 0)    return false;
        if (obj.length === 0)  return true;

        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) return false;
        }

        return true;
    }



    _this.init();

    return _this;
};
