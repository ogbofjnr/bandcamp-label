document.addEventListener('DOMContentLoaded', function () {
    var syncButton = document.getElementById('syncButton');
    syncButton.addEventListener('click', function () {
      chrome.tabs.create({ url: 'https://bandcamp.com/ogbofjnr/following/artists_and_labels' });
    }, false);
  
    var testScrollButton = document.getElementById('testScroll');
    testScrollButton.addEventListener('click', function () {
      chrome.runtime.sendMessage({action: "scrollToBottom"});
    }, false);

    var testSaveButton = document.getElementById('testSave');
    testSaveButton.addEventListener('click', function () {
        chrome.runtime.sendMessage({action: "testSave"});
    }, false);
    
  }, false);
  