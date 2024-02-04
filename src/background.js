// background.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "scrollToBottom") {
      chrome.tabs.executeScript(null, {file: 'content.js'});
    }
  });
  
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "saveHTML") {
        var blob = new Blob([request.html], {type: "text/html"});
        var url = URL.createObjectURL(blob);
        chrome.downloads.download({
            url: url,
            filename: "saved_page.html"
        });
        console.log('Saved!!!');
    }
});