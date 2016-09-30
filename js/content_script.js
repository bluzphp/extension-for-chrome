(function (){
  var debugPre = document.getElementsByTagName('pre');
  if (debugPre) {
    var debugText = [];
    for (key in debugPre) {
      if (debugPre[key].innerHTML) {
        if (debugPre[key].innerHTML.charAt(0) === '#') {
          var newDebugText = debugPre[key].innerHTML.replace(/&gt;/gi, '>');
          debugText.push(newDebugText);
        }
      }
      if (typeof debugPre[key] === 'object') {
        //debugPre[key].style.display = 'none';
      }
    }

    chrome.storage.sync.set({
      debugText: debugText
    })

    //chrome.runtime.sendMessage({type: "sendDebugText", debugText: debugText});
  }
})()
