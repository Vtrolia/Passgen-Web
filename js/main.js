window.onload = () => {
    var authButton = document.getElementById("auth");
    auth.onclick = authenticate;
    
    var regButton = document.getElementById("reg");
    regButton.onclick = register;
    
    var sub = document.getElementById("sub");
    sub.onclick = submit;
    
    
}

function authenticate() {
    var key = document.getElementById("key").value;
    var storedPasswords = JSON.parse(localStorage.getItem(key));
    var list = document.getElementById("lister");
    document.getElementById("form").style.display = "None";
    
    list.style.display = "inherit";
}

function register() {
    return false;
}

function submit() {
    return false;
}