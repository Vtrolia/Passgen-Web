// there really isn't anything that needs to be in the background, so background.js
// just passes the message onto the content script.
chrome.extension.onMessage.addListener(
    function listener(request) {
        alert("got the message!");
        chrome.runtime.sendMessage(request);
    });