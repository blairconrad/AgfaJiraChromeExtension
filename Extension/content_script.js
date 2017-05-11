chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    var issueNumber = document.getElementById('key-val').textContent;
    var issueTitle = document.getElementById('summary-val').textContent;

    if (request.action == 'get page details') {
      sendResponse({title: issueTitle, issueNumber: issueNumber});
    }

    if (request.action == 'send e-mail') {
      window.location.href =
        'mailto:?cc=iitsjira.mailaccount@agfa.com&subject=' + issueNumber + ' - ' + issueTitle + '&body=%0D%0A%0D%0Ahttp://jiraprod.agfahealthcare.com/browse/' + issueNumber;

      // If we return right away, the window doesn't have time to start the mailto.
      // Half a second should be enough time.
      setTimeout(function() {}, 500);
    }
});
