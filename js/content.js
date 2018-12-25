// keep the names to the sites
var name_to_url = {};

// like name to URL, the big tech companies have one login portal for many of their 
// services. also, there are default url signin pages that should be tried first
const labels = {
    "urls": { 
        "groups": ["/login", "/signin", "sign-in", "/account"],
        "login": request["url"]
    },
    
    "google": {
        "groups": ["youtube", "gmail", "google"],
        "login": "https://accounts.google.com/signin"
    },
               
    amazon: {
        "groups": ["audible.com", "imdb.com", "amazon", "twitch.tv"],
        "login": "https://www.amazon.com/ap/signin?_encoding=UTF8&ignoreAuthState=1&openid.assoc_handle=usflex&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.mode=checkid_setup&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.ns.pape=http%3A%2F%2Fspecs.openid.net%2Fextensions%2Fpape%2F1.0&openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.com%2F%3Fref_%3Dnav_custrec_signin&switch_account="
        },
    
    microsoft: {
        "groups": ["microsoft", "bing", "live", "hotmail" "xbox"],
        "login": "https://login.live.com/login.srf?wa=wsignin1.0&rpsnv=13&ct=1545735599&rver=7.0.6738.0&wp=MBI_SSL&wreply=https:%2F%2Faccount.microsoft.com%2Fauth%2Fcomplete-signin%3Fru%3Dhttps%253A%252F%252Faccount.microsoft.com%252F%253Frefp%253Dsignedout-index%2526refd%253Dwww.microsoft.com&lc=1033&id=292666&lw=1&fl=easi2"
    }
            
}


/*
 *
 */
chrome.runtime.onMessage.addListener(
    function(request) {
        request = JSON.parse(request);
        var request;
        
        if(!name_to_url[request['url']]) {
            for (let site in labels) {
                request = new XMLHttpRequest();
                if (site === "urls") {
                    for (let i = 0; i < site["groups"].length; i++) {
                        request.open("POST", site["login"] + site["groups"][i], true);
                        request.send();
                        
                    }
                }
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