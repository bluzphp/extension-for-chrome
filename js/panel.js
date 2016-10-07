var btnDebug = document.getElementById('btnDebug');
var switchDebug = document.querySelector('.switchDebug');
var btnProfiler = document.getElementById('btnProfiler');
var switchProfiler = document.querySelector('.switchProfiler');
var bluzDetails = document.querySelector('.bluz-details');
var bluzLogs = document.querySelector('.bluz-logs');
var pluginBox = document.getElementById('pluginBox');
var logsTable = document.getElementById('logsTable');

var cookie = document.querySelector('.cookie');
var debug = document.querySelector('.debug');
var logs = document.querySelector('.logs');

cookie.addEventListener('click', function() {
  showInfo('cookie')
  chrome.storage.sync.set({
    isChecked: 'cookie'
  })
});

debug.addEventListener('click', function() {
  showInfo('debug')
  chrome.storage.sync.set({
    isChecked: 'debug'
  })
});

logs.addEventListener('click', function() {
  showInfo('logs')
  chrome.storage.sync.set({
    isChecked: 'logs'
  })
});

window.addEventListener('load', function() {
  chrome.storage.sync.get(["data", "debug", "profiler", "debugText", "isChecked"], function(res) {
    bluzDetails.textContent = res.debugText;

    var devToolsContent__header = document.querySelector('.devToolsContent__header');
    var arrData = res.data.split('; ');
    arrData.forEach(function(item) {
      var span = document.createElement('span');
      span.textContent = item;
      devToolsContent__header.appendChild(span);
    });

    if (res.debug) {
      btnDebug.checked = true;
      switchDebug.className = 'switch switchDebug switch-on';
    }
    if (res.profiler) {
      btnProfiler.checked = true;
      switchProfiler.className = 'switch switchProfiler switch-on';
    }

    switch(res.isChecked) {
      case 'cookie':
        showInfo('cookie')
        break;
      case 'debug':
        showInfo('debug')
        break;
      case 'logs':
        showInfo('logs')
        break;
      default:
        showInfo('cookie')
    }
  })
  parseBarParams()
});

btnDebug.addEventListener('click', function(el) {
  el = el.toElement;
  if (el.checked) {
    switchDebug.className = 'switch switch--animate switchDebug switch-on';
    respond('btnDebug-addCookie')
  } else {
    switchDebug.className = 'switch switch--animate switchDebug switch-off';
    respond('btnDebug-removeCookie')
  }
});

btnProfiler.addEventListener('click', function(el) {
  el = el.toElement;
  if (el.checked) {
    switchProfiler.className = 'switch switch--animate switchProfiler switch-on';
    respond('btnProfiler-addCookie')
  } else {
    switchProfiler.className = 'switch switch--animate switchProfiler switch-off';
    respond('btnProfiler-removeCookie')
  }
});

function parseBarParams() {
  var logsTable = document.getElementById('logsTable');
  chrome.storage.sync.get(['barParams'], function(res) {
    for (var val in res.barParams){
      var param = JSON.parse(res.barParams[val]);
      for ( var i in param) {
        var infoArr = i.split(' :: ');

        var newTr = document.createElement('tr');
        logsTable.appendChild(newTr);

        var newTd1 = document.createElement('td');
        newTd1.innerHTML = infoArr[0];
        var newTd2 = document.createElement('td');
        newTd2.innerHTML = infoArr[1];
        var newTd3 = document.createElement('td');
        newTd3.innerHTML = infoArr[2];
        var newTd4 = document.createElement('td');
        newTd4.innerHTML = param[i];


        newTr.appendChild(newTd1);
        newTr.appendChild(newTd2);
        newTr.appendChild(newTd3);
        newTr.appendChild(newTd4);
      }
    }
  })
}

function reloadPage() {
  location.reload();
}

function respond(msg) {
  var port = chrome.runtime.connect({name: 'devtools'});
  port.postMessage(msg);
}

function showInfo (info) {
  if (info === 'cookie') {
    pluginBox.style.display = 'block';
    bluzDetails.style.display = 'none';
    bluzLogs.style.display = 'none';
  }
  if (info === 'debug') {
    pluginBox.style.display = 'none';
    bluzDetails.style.display = 'block';
    bluzLogs.style.display = 'none';
  }
  if (info === 'logs') {
    pluginBox.style.display = 'none';
    bluzDetails.style.display = 'none';
    bluzLogs.style.display = 'block';
  }
}
