// there really isn't anything that needs to be in the background, so background.js
// just passes the message onto the content script.
chrome.extension.onMessage.addListener(function (request) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) =>{
        chrome.tabs.sendMessage(tabs[0].id, request, () => {});
    });
});

// listener for content sending message to popup
chrome.runtime.onMessage.addListener(
    function responder(request) {
        chrome.extension.sendMessage(request);
    });