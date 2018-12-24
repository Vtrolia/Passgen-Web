// there really isn't anything that needs to be in the background, so background.js
// just passes the message onto the content script.
chrome.extension.onMessage.addListener(
    function listener(request) {
        // testing 1 2 3
        alert("got the message!");
        chrome.runtime.sendMessage(request);
    });

// listener for content sending message to popup
chrome.runtime.onMessage.addListener(
    function responder(request) {
        alert("got the response!");
        chrome.extension.sendMessage(request);
    });