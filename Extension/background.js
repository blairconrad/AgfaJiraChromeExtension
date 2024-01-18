// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const urlMatch = 'jiraprod.agfahealthcare.com/browse/[A-Z][A-Z0-9]+-[0-9]+';

function copyToClipboard(text) {
  var ta = document.getElementById('ta');
  ta.style.display = 'block';
  ta.value = text;
  ta.select();
  document.execCommand('copy');
  ta.style.display = 'none';
}

function snagTitle(pageDetails) {
  copyToClipboard(pageDetails.issueNumber + ' - ' + pageDetails.title);
}

function snagLink(pageDetails) {
  copyToClipboard('[' + pageDetails.issueNumber + ' - ' + pageDetails.title + '](http://jiraprod.agfahealthcare.com/browse/' + pageDetails.issueNumber + ')');
}

function snagHtmlLink(pageDetails) {
  var anchor = document.getElementById('htmlLink');
  anchor.setAttribute("href", "http://jiraprod.agfahealthcare.com/browse/" + pageDetails.issueNumber);
  anchor.innerHTML = pageDetails.issueNumber + ' - ' + pageDetails.title;

  var div = document.getElementById('htmlLinkDiv');
  div.style.display = 'block';
  
  var range = document.createRange();
  range.selectNodeContents(div);

  var selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange( range );

  document.execCommand('copy');
  div.style.display = 'none';
}

// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function () {
  // Replace all rules ...
  if (chrome.declarativeContent) {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
      // With a new rule ...
      chrome.declarativeContent.onPageChanged.addRules([
        {
          // That fires when a page's URL has the right host
          conditions: [
            new chrome.declarativeContent.PageStateMatcher({
              pageUrl: {
                urlMatches: urlMatch
              },
            })
          ],
          // And shows the extension's page action.
          actions: [new chrome.declarativeContent.ShowPageAction()]
        }
      ]);
    });
  }
});

// for Firefox, updating a tab
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) { 
  if (changeInfo.status === 'complete' && tab && tab.url && tab.url.match(urlMatch)) {
    chrome.pageAction.show(tabId);
  } else if (changeInfo.status === 'complete') {
    chrome.pageAction.hide(tabId);
  }
});

// for Firefox, creating a new tab
chrome.tabs.onCreated.addListener(function(tab) {
  if (tab.url && tab && tab.url && tab.url.match(urlMatch)) {
    chrome.pageAction.show(tab.id);
  } else if (tab.url) {
    chrome.pageAction.hide(tab.id);
  }
});

chrome.commands.onCommand.addListener(function (command) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var tabId = tabs[0].id;
    chrome.tabs.sendMessage(tabId, { action: 'get page details' }, function (response) {
      if (command === "copy-title") {
        snagTitle(response);
      } else if (command === "copy-link") {
        snagLink(response);
      } else if( command === "copy-html-link" ) {
        snagHtmlLink(response);
      } else if( command === "send-email" ) {
        chrome.tabs.sendMessage(tabId, {action: 'send e-mail'});
      }
    });
  });
});
