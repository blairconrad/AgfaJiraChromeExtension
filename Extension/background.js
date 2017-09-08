// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

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

// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function () {
  // Replace all rules ...
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    // With a new rule ...
    chrome.declarativeContent.onPageChanged.addRules([
      {
        // That fires when a page's URL has the right host
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              urlMatches: 'jiraprod.agfahealthcare.com/browse/[A-Z][A-Z0-9]+-[0-9]+'
            },
          })
        ],
        // And shows the extension's page action.
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }
    ]);
  });
});

chrome.commands.onCommand.addListener(function (command) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var tabId = tabs[0].id;
    chrome.tabs.sendMessage(tabId, { action: 'get page details' }, function (response) {
      if (command === "copy-title") {
        snagTitle(response);
      } else if (command === "copy-link") {
        snagLink(response);
      } else if (command === "send-email") {
        chrome.tabs.sendMessage(tabId, { action: 'send e-mail' });
      }
    });
  });
});
