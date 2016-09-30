chrome.devtools.panels.create("Bluz debugger", "../images/bluz-64.png", "../html/panel.html", (extensionPanel) => {
  var _window;

  var data = [];
  var cookieDebug = '';
  var cookieProfiler = '';
  var barParams = '';
  var port = chrome.runtime.connect({name: 'devtools'});
  port.onMessage.addListener(function(msg) {
      if (_window) {
          _window.showDebug(msg);
      } else {
          //data = msg;
          data.push(msg.debugText);
          cookieDebug = msg.debug;
          cookieProfiler = msg.profiler;
          barParams = msg.barParams['Bluz-Bar'];
      }
  });

  extensionPanel.onShown.addListener(function tmp(panelWindow) {
      extensionPanel.onShown.removeListener(tmp);
      _window = panelWindow;

      var msg;
      while (msg = data.shift()) {
        _window.showDebug(msg, cookieDebug, cookieProfiler, barParams);
      }

      _window.respond = function(msg) {
          port.postMessage(msg);
      };
  });
})
