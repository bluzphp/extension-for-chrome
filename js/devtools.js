chrome.devtools.panels.create("Bluz debugger", "../images/bluz-64.png", "../html/panel.html", function (extensionPanel) {
  var _window;

  var data = [];
  var port = chrome.runtime.connect({name: 'devtools'});
  port.onMessage.addListener(function(msg) {
      if (msg.message) {
        _window.reloadPage();
      }

      if (_window) {
          _window.showDebug(msg);
      } else {
          data.push(msg.debugText);
      }
  });

  extensionPanel.onShown.addListener(function tmp(panelWindow) {
      extensionPanel.onShown.removeListener(tmp);
      _window = panelWindow;

      var msg;
      while (msg = data.shift()) {
        _window.showDebug(msg);
      }
  });
})
