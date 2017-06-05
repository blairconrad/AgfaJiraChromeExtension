function saveOptions() {
  var commentSorting = 'no-sort';
  var commentSortingOptions = document.getElementsByName('comment-sorting');
  for (var i = 0; i < commentSortingOptions.length; ++i) {
      if (commentSortingOptions[i].checked) {
          commentSorting = commentSortingOptions[i].value;
      }
  }

  chrome.storage.sync.set({
    commentSorting: commentSorting
  }, function() {
    // Update status to let user know options were saved.
    var save = document.getElementById('save');
    save.textContent = 'Options saved.';
    save.disabled = true;
    setTimeout(function() {
      save.textContent = 'Save';
      save.disabled = false;
    }, 750);
  });
}

function restoreOptions() {
  chrome.storage.sync.get({
    commentSorting: 'no-sort'
    }, function(items) {
        var commentSortingOptions = document.getElementsByName('comment-sorting');
        for (var i = 0; i < commentSortingOptions.length; ++i) {
            if (commentSortingOptions[i].value === items.commentSorting) {
                commentSortingOptions[i].checked = true;
            }
        }
  });
}
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);