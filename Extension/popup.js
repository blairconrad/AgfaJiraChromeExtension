function onWindowLoad() {
  chrome.tabs.executeScript(null, { file: "content_script.js" }, function() {
    // If you try and inject into an extensions page or the webstore/NTP you'll get an error
    if (chrome.runtime.lastError) {
      alert('There was an error injecting script: \n' + chrome.runtime.lastError.message);
    }
  });

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var tabId = tabs[0].id;
    chrome.tabs.sendMessage(tabId, {action: 'get page details'}, function(response) {
      if ( ! response )
      {
        var lis = document.getElementsByTagName('li');
        for ( var i = 0; i < lis.length; i++ )
        {
          lis[i].style.cursor = 'not-allowed';
        }

        return;
      }

      var titleItem = document.getElementById('title_item');
      titleItem.onclick = function(event) {
        snagTitle(response);
        window.close();
      }

      var urlItem = document.getElementById('url_item');
      urlItem.onclick = function(event) {
        snagLink(response);
        window.close();
      }

      // We can't set window.location.href from within a popup's code,
      // so delegate to the code we've injected into the host page.
      var emailItem = document.getElementById('email_item');
      emailItem.onclick = function(event) {
        chrome.tabs.sendMessage(tabId, {action: 'send e-mail'});
        window.close();
      }
    });
  });
}

window.onload = onWindowLoad;
