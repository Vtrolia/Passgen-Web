var name_to_url = {};

chrome.runtime.onMessage.addListener(
    function(request) {
        request = JSON.parse(request);
        
        if(!name_to_url[request['url']]) {
            let urls = ["/login", "/signin", "/account"]
        }
})

function urlChecker(url) {
    var request = new XMLHttpRequest();
    request.open("POST", url, true);
    request.send();
    
    if (request.status === 404) {
        return false;
    }
    
    return true;
}