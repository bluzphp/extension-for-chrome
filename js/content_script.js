(function (){
  var debugPre = document.getElementsByClassName('bluz-debug');
  if (debugPre) {
    var debugText = [];
    for (key in debugPre) {
      if (debugPre[key].innerHTML) {
        var newDebugText = debugPre[key].innerHTML.replace(/&gt;/gi, '>');
        debugText.push(newDebugText);
      }
      if (typeof debugPre[key] === 'object') {
        debugPre[key].style.display = 'none';
      }
    }
    chrome.storage.sync.set({
      debugText: debugText
    })
  }
})()
