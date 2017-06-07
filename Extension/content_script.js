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

function setIssueActivitySortDirection(direction) {
  var sortLink = document.getElementsByClassName('issue-activity-sort-link')[0];
  if (sortLink) {
    var dataOrder = sortLink.getAttribute('data-order');
    if (dataOrder) {
      if (dataOrder == direction) { // we're sorting in the wrong order
        // toggle the sort order (forces a page reload)
        window.location.replace(sortLink.getAttribute('href'));
      }

      // the sort order will stick for the session, so no need to continue checking
      return;
    }
  }

  setTimeout(function() { setIssueActivitySortDirection(direction); }, 100);
}

chrome.storage.sync.get({
  commentSorting: 'no-sort'
  },
  function(items) {
    if (items) {
      if (items.commentSorting === 'no-sort') {
        return;
      } else {
        setIssueActivitySortDirection(items.commentSorting);
      }
    }
  });