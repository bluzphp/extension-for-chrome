var btnDebug = document.getElementById('btnDebug');
var btnProfiler = document.getElementById('btnProfiler');
var bluzDetails = document.getElementsByClassName('bluz-details')[0];
var bluzLogs = document.getElementsByClassName('bluz-logs')[0];
var pluginBox = document.getElementById('pluginBox');
var logsTable = document.getElementById('logsTable');

function showDebug(msg) {
  bluzDetails.textContent = msg;
  bluzDetails.style.display = 'none';
  bluzLogs.style.display = 'none';
  parseBarParams()
}

var cookie = document.getElementsByClassName('cookie')[0];
cookie.onclick = function() {
  pluginBox.style.display = 'block';
  bluzDetails.style.display = 'none';
  bluzLogs.style.display = 'none';
  respond('cookie')
};

var debug = document.getElementsByClassName('debug')[0];
debug.addEventListener('click', function() {
  pluginBox.style.display = 'none';
  bluzDetails.style.display = 'block';
  bluzLogs.style.display = 'none';
  respond('debug')
});

var logs = document.getElementsByClassName('logs')[0];
logs.addEventListener('click', function() {
  pluginBox.style.display = 'none';
  bluzDetails.style.display = 'none';
  bluzLogs.style.display = 'block';
  respond('logs')
});

window.onload =  function() {
  chrome.storage.sync.get(["data", "debug", "profiler"], function(res) {
    var devToolsContent__header = document.getElementsByClassName('devToolsContent__header')[0];
    var arrData = res.data.split('; ');
    arrData.forEach(function(item) {
      var span = document.createElement('span');
      span.textContent = item;
      devToolsContent__header.appendChild(span);
    });
    if (res.debug) {
      btnDebug.setAttribute('class', 'btn btn-success');
      btnDebug.innerHTML = 'ON';
    }
    if (res.profiler) {
      btnProfiler.setAttribute('class', 'btn btn-success');
      btnProfiler.innerHTML = 'ON';
    }
  })
  parseBarParams()
};

btnDebug.addEventListener('click', function(el) {
  el = el.toElement;
  if (el.className === 'btn btn-danger') {
    el.setAttribute('class', 'btn btn-success');
    el.innerHTML = 'ON';
    respond('btnDebug-addCookie')
  } else {
    el.setAttribute('class', 'btn btn-danger');
    el.innerHTML = 'OFF';
    respond('btnDebug-removeCookie')
  }
});

btnProfiler.addEventListener('click', function(el) {
  el = el.toElement;
  if (el.className === 'btn btn-danger') {
    el.setAttribute('class', 'btn btn-success');
    el.innerHTML = 'ON';
    respond('btnProfiler-addCookie')
  } else {
    el.setAttribute('class', 'btn btn-danger');
    el.innerHTML = 'OFF';
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