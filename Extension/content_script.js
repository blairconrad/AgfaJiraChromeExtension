chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    var issueNumber = document.getElementById('key-val').textContent;
    var issueTitle = document.getElementById('summary-val').textContent;

    if (request.action == 'get page details') {
      sendResponse({ title: issueTitle, issueNumber: issueNumber });
    }

    if (request.action == 'send e-mail') {
      window.location.href =
        'mailto:?cc=iitsjira.mailaccount@agfa.com&subject=' + issueNumber + ' - ' + issueTitle + '&body=%0D%0A%0D%0Ahttp://jiraprod.agfahealthcare.com/browse/' + issueNumber;

      // If we return right away, the window doesn't have time to start the mailto.
      // Half a second should be enough time.
      setTimeout(function () { }, 500);
    }
  });

function setIssueActivitySortDirection(direction) {
  var sortLink = document.getElementsByClassName('issue-activity-sort-link')[0];
  if (sortLink) {
    var dataOrder = sortLink.getAttribute('data-order');
    if (dataOrder) {
      if (dataOrder == direction) { // we're sorting in the wrong order
        // toggle the sort order (forces a page reload)
        var newLocation = sortLink.getAttribute('data-ajax');
        if (newLocation) {
          window.location.replace(newLocation);
        } else {
          console.log('Could not find data-ajax attribute on sort link. Cannot change sort order.');
        }
      }

      // the sort order will stick for the session, so no need to continue checking
      return;
    }
  }

  setTimeout(function () { setIssueActivitySortDirection(direction); }, 100);
}

chrome.storage.sync.get({
  commentSorting: 'no-sort'
},
  function (items) {
    if (items) {
      if (items.commentSorting === 'no-sort') {
        return;
      } else {
        setIssueActivitySortDirection(items.commentSorting);
      }
    }
  });

function isAlreadyLinked(node) {
  while (node.parentNode) {
    node = node.parentNode;
    if (node.nodeName.toUpperCase() == 'A') {
      return true;
    }
  }
  return false;
}

function replace(originalNode, newNode) {
  originalNode.parentNode.replaceChild(newNode, originalNode);
}

function getTextNodeIterator() {
  return document.createNodeIterator(
    document.body,
    NodeFilter.SHOW_TEXT,
    { acceptNode: function (node) { return NodeFilter.FILTER_ACCEPT; } },
    false
  );
}

function addServiceNowLinks() {
  var serviceNowRegex = /((CMTSK|COM|PRB)[0-9]+)/g;

  var iterator = getTextNodeIterator();
  var textNode;
  while ((textNode = iterator.nextNode()) != null) {
    try {
      if (!textNode.nodeValue || isAlreadyLinked(textNode) || !textNode.nodeValue.match(serviceNowRegex)) {
        continue;
      }

      var span = document.createElement('span');
      span.innerHTML = textNode.nodeValue.replace(
        serviceNowRegex,
        '<a href="https://agfa.service-now.com/textsearch.do?sysparm_search=$1">$1</a>');
      replace(textNode, span);
    } catch (err) {
      console.log("Unknown error while adding ServiceNowLinks", err);
    }
  }
}

function formatDatesBetter() {
  var allLivestamps = document.getElementsByClassName('livestamp');
  for (var i = allLivestamps.length - 1; i >= 0; --i) {
    var livestamp = allLivestamps[i];
    try {
      // datetime has looked like "2020-12-15T14:22:57-0500", so drop
      // the seconds and timezone and make the T a space, for readability.
      var newText = livestamp.attributes['datetime'].textContent
        .substring(0, 16)
        .replace('T', ' ');
      if (newText != livestamp.innerHTML) {
        var span = document.createElement('span');
        span.innerHTML = newText;
        replace(livestamp, span);
      }
    } catch (err) {
      console.log('Unknown error while formatting dates', err);
    }
  }
}

var contentNode = document.getElementById('content');
if (contentNode) {
  MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  var observer = new MutationObserver(function (mutations, theObserver) {
    theObserver.disconnect();
    theObserver.takeRecords();
    addServiceNowLinks();
    formatDatesBetter();
    theObserver.observe(document, {
      subtree: true,
      childList: true,
    });
  });

  observer.observe(contentNode, {
    subtree: true,
    childList: true,
  });
}

addServiceNowLinks();
formatDatesBetter();
