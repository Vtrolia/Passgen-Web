/* Because of the nature of Chrome Extensions, adding the onclick functions to the
 * buttons in the html files is not allowed, so when the popup is loaded, add it with 
 * Javascript.
 */
window.onload = function (){
    var authButton = document.getElementById("auth");
    auth.onclick = authenticate;
    
    var regButton = document.getElementById("reg");
    regButton.onclick = register;
    
    var sub = document.getElementById("sub");
    sub.onclick = submit;
    
    var back = document.getElementById("back");
    back.onclick = goBack;
    
    var newp = document.getElementById("newPass");
    newp.onclick = reset;
    
    var rem = document.getElementById("remove");
    rem.onclick = remover;
    
    var go = document.getElementById("goto");
    goto.onclick = goToSite;
    
    // allows user to sign in by pressing enter, instead of having to drag the mouse
    // to the sign in button, much more intuitive
    document.getElementById("form").onkeypress = (e) => {
        if (e.keyCode === 13) {
            authenticate();
            return false;
        }
    };
    
    // in order for the URLs to be parsed and entered correctly, there is a specific
    // way they need to be formatted and this checks for it, i.e. 'domainname.tld'
    document.getElementById("url").onkeydown = (e)  => {
        var urlField = document.getElementById("url");
        let fieldText = urlField.value;
        
        // because many of these options disable the button, this function keeps from
        // rewriting it over and over
        function disable() {
            document.getElementById("sub").disabled = true;
            urlField.style.borderColor = "red";
        }
        
        // disable if backspace or delete is pressed
        if(e.keyCode === 8 || e.keyCode === 46) {
            disable();
            return true;
        }
        
        // there needs to be at least one period or else it's not the right format
        if (!fieldText.match(/\./)) {
            disable();
            return true;
        }
        
        // if they type 'www.x.com' its invalid, only one period and no slashes
        if(fieldText.includes("/") || fieldText.match(/\./gi).length > 1) {
            
            // check if there are more than 2 words
            let values = fieldText.split(".");
            if (values.length != 2) {
                disable();
                return true;
            }
            
            // if any part is left null, disable
            for (let i in values) {
                if (i.length < 2) {
                    disable();
                    return true;
                }
            }
            
            disable();
            
        }
        
        // if all tests pass, let them enter
        else {
           document.getElementById("sub").disabled = false;
           urlField.style.borderColor = "lightblue";
        }
    };
    
}


// constants we need to keep track of
var key = "";
var storedPasswords;


// reset the display
function resetDisplay() {
    var register = document.getElementById("register");
    register.style.display = "none";
    if (register.querySelector("#url")) {
        register.querySelector("#url").value = "";
        register.querySelector("#username").value = "";
    }

    // before, it would just stack the accounts on top of each other, now we 
    // delete all the previous entries so it can stack again. 
    var tds = document.querySelectorAll("td");
    for (let i = 0; i < tds.length; i++) {
        tds[i].parentElement.removeChild(tds[i]);
    }
}


/*
 * Each user on a browser has a set key where all their passwords are stored. In 
 * future installments I plan on adding a PGP system where a user can only decrypt 
 * their passwords with their key, but for now it's all just local plaintext. This 
 * function loads all the passwords they currently have and loads the screen that 
 * displays them
 */
function authenticate() {
    // select the elements that we need, getting key if this is where to user first 
    // logged in
    if (!key) {
        key = document.getElementById("key").value;
    }
    storedPasswords = JSON.parse(localStorage.getItem(key));
    var list = document.getElementById("lister");
    var table = document.querySelector("table");
    
    // set the login element to not display, display the table of passwords
    document.getElementById("form").style.display = "None";
    list.style.display = "inherit";
    
    // for each password in this user, show them their username and their password 
    for (let key in storedPasswords) {
        if (storedPasswords.hasOwnProperty(key)) {
            table.innerHTML += "<tr class='selectable'>" +
            "<td class='name'>" + key + "</td>" +
            "<td class='user'>" + storedPasswords[key]["username"] + "</td>" +
            "<td class='pass'>" + storedPasswords[key]['password']+ "</td>";
        }
    }
    
    // each row needs to be clickable to go to the site's page that gives the user 
    // more options
    var rows = document.querySelectorAll(".selectable");
    for (let i = 0; i < rows.length; i++){
        rows.item(i).addEventListener("click", function() {goToSitePage(rows.item(i));});
    }
    
    // if this is a new key, give them a warning and let them set up their passwords
    if (!storedPasswords) {
        document.getElementById("lister").innerHTML += "<div id=\"warning\">No passwords available! add more below!</div>" 
        document.getElementById("reg").style.top = "30%";
        document.getElementById("reg").onclick = register;
    }
}


// this function just brings up the new registration screen
function register() {
    document.getElementById("lister").style.display = "None";
    document.getElementById("register").style.display = "inherit";
}

/*
 * This function is what creates new passwords and accounts for the user and adds it
 * to local storage. This right here is your proof that all data is stored locally!
 * As it is currently, the password is not generated by us but that will be added soon
 * once I port my own TroliAlgorithm from python. 
 */
function submit() {
    // get the fields the user filled in
    var name = document.getElementById("url");
    var user = document.getElementById("username");
    
    // if the user left a trailing period, there's a bug where it lets them enter it.
    // this fixes and removes that trailing period
    if (name.value[name.value.length - 1] === ".") {
        name.value = name.value.substring(0, name.value.length - 1);
    }
    
    // if the name is blank or password already exists, send the user back
    try {
        if(!name.value || name.value.toLowerCase() in storedPasswords) {
            alert("You already have this account stored!");
            resetDisplay();
            return authenticate();
        }
    }
   catch{}
    
    // reset the table display to normal
    if (document.getElementById("warning")) {
        document.getElementById("warning").style.display = "None";
        document.getElementById("reg").style.top = "";
    }
    
    // if passwords is null, create it
    if (!storedPasswords) { storedPasswords = {};}
    
    // add the entry to the JSON object stored on the user's computer
    storedPasswords[name.value.toLowerCase()] = {
        "username": user.value,
        "password": troliAlgorithm(user.value, name.value)
    };
    
    // reset the JSON stored into what we have noe
    localStorage.setItem(key, JSON.stringify(storedPasswords));
    resetDisplay();

    // redraw
    authenticate();
}


/*
 * This funxtion is for when a user has picked a specific site they want to visit and
 * takes the values already loaded from storage and displays it to them. They can't
 * change values from the site screen, but they will have the chance to change them 
 * through the options on that screen.
 * @param row: the row that was clicked, it passes itself into this function upon
 * the user clicking it
 */
function goToSitePage(row) {
    // get the site div and load the values into it
    var site = document.getElementById("sitePage");
    site.querySelector("#siteTitle").innerHTML = row.querySelector(".name").innerHTML
    site.querySelector("#siteUser").value = row.querySelector(".user").innerHTML;
    site.querySelector("#sitePass").value = row.querySelector(".pass").innerHTML;
    
    // change which div is displayed to the user
    document.getElementById("lister").style.display = "none";
    document.getElementById("sitePage").style.display = "block";
}


// returns from a site's page back to the screen that lists all their accounts
function goBack() {
    document.getElementById("sitePage").style.display = "none";
    resetDisplay();
    authenticate();
}


/*
 * Computes a new password for the user's account. If you notice, it calls the 
 * troliAlgorithm twice. Then it sets the password displayed on the sitepage and
 * the one stored in localStorage is changed to the current value
 */
function reset() {
    var password = troliAlgorithm(document.getElementById("sitePass").value, 
                                  document.getElementById("siteUser").value);
    var site = document.getElementById("siteTitle").innerHTML;
    password = troliAlgorithm(password, key);
    storedPasswords[site]['password'] = password;
    localStorage.setItem(key, JSON.stringify(storedPasswords));
    document.getElementById("sitePass").value = password;
}


/*
 * Takes the site being currently displayed and deletes its entry in the user's
 * saved entries then brings them back to the list screen.
 */
function remover () {
    delete storedPasswords[document.getElementById("siteTitle").innerHTML];
    document.getElementById("sitePage").style.display = "None";
    localStorage.setItem(key, JSON.stringify(storedPasswords));
    resetDisplay();
    authenticate();
}


/*
 * In order to launch a new login for a site, the popup needs to communicate with the
 * scripts running in the background. Chrome's runtime API allows main.js to send
 * the url of the website, the user's username and their password.
 */
function goToSite() {
    var connection = chrome.extension.connect({
        name: "background-script"
    });
    
    var message = {
        "url": "http://www." + document.getElementById("siteTitle").innerHTML,
        "username": document.getElementById("siteUser").value,
        "password": document.getElementById("sitePass").value
    };
    
    conection.postMessage(JSON.stringify(message));
    
}



/*
 * This function is a port of the same password generator algorithm I used in the 
 * python desktop version, the first program I ever made. The program's original name
 * is where Passgen Web gets its name from. Instead of being an awful looking GUI
 * program that needs a python runtime, I figured turning this into a password manager
 * would make it more useful.
 * @param salt: a string
 * @param word: a string
 * @returns: a string representing the algorithm's result
 */
function troliAlgorithm(salt, word) {
    // array of 10 values, though the resulting string will be larger
    password = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    
    // for a few parts of the array, it chooses a random letter
    asciiLet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p',
                 'q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F',
                 'G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V',
                 'W','X','Y','Z'];
    
    // generates differently depending on whether or not the words are even or odd
    if (((salt.length + word.length) % 2) === 0) {
        password[0] = Math.floor((salt.length + word.length) / salt.length);
        
        // this will be a two character string
        if (salt.length < 2 && word.length < 2) {
            password[1] = salt[password[0]] + word[password[0]];
        }
        else {
            password[1] = salt[0] + word[0];
        }
    
        password[2] = Math.abs(salt.length - word.length);
        
        // remainder of some simple subtraction, can be negative
        let temp = password[2];
        while (temp >= salt.length) {
            temp -= salt.length;
        }
        password[3] = salt[temp];
        
        // choose a number between 1 and current milliseconds from the epoch and 
        // divide it by 1000
        let d = new Date();
        password[4] = Math.floor((Math.random() * (d.getTime() - 1) + 1) / 1000);
        
        // random letter from ascii letters
        password[5] = asciiLet[Math.floor(Math.random() * asciiLet.length)];
        
        // choose a random number between the lengths of the two words
        if (word.length > salt.length) {
            password[6] = Math.floor(Math.random() * 
                        (((word.length + 1) - salt.length) + salt.length));
        }
        else {
            password[6] = Math.floor(Math.random() * 
                        (((salt.length + 1) - word.length) + word.length));
        }
        
        // get a char, then get the int code from that char
        password[7] = String.fromCharCode(password[6] + 95);
        password[8] = password[7].charCodeAt(0) * password[6];
        
        // add some of the characters of the word together
        password[9] = "";
        let max = 0;
        if (salt.length > word.length) {
            max = word.length;
        }
        else {
            max = salt.length;
        }
        for (let i = 0; i < max % 4; i++) {
            password[9] += salt[i] + word[i];
        }
    }
    
    else {
        // random ascii letter
        password[0] = asciiLet[Math.floor(Math.random() * asciiLet.length)];
        
        password[1] = Math.floor((salt.length + word.length) / salt.length);
        
        // random letters from both words
        password[2] = "";
        let max = 0;
        if (salt.length > word.length) {
            max = word.length;
        }
        else {
            max = salt.length;
        }
        for (let i = 0; i < max % 4; i++) {
            password[2] += salt[i] + word[i];
        }
        
        // choose a random number between the lengths of the two words
        if (word.length > salt.length) {
            password[3] = Math.floor(Math.random() * 
                        (((word.length + 1) - salt.length) + salt.length));
        }
        else {
            password[3] = Math.floor(Math.random() * 
                        (((salt.length + 1) - word.length) + word.length));
        }
        
        // get a character and then the character code
        password[4] = String.fromCharCode(password[1] + 95);
        password[5] = password[4].charCodeAt(0) * password[3];
        
        // absolute value of difference
        password[6] = Math.abs(salt.length - word.length);
        
        // remainder of some simple subtraction, can be negative
        let temp = password[6];
        while (temp >= salt.length) {
            temp -= salt.length;
        }
        password[7] = word[temp];
        
        // choose a number between 1 and current milliseconds from the epoch and 
        // divide it by 1000
        let d = new Date();
        password[8] = Math.floor((Math.random() * (d.getTime() - 1) + 1) / 1000);
        if (salt.length < 1 && word.length < 1) {
            password[9] = salt[password[0]] + word[password[0]];
        }
        else {
            password[9] = salt[0] + word[0];
        }
    }
    
    // makes sure to convert each part of the array into a string, and gets rid
    // of a random bug that sometimes produces the ` character
    for (let i = 0; i < 10; i++) {
        if (password[i] === '`') {
            password[i] = asciiLet[Math.floor(Math.random() * asciiLet.length)];
        }
        try{
            password[i] = password[i].toString();
        }
        catch{continue;}
    }
    
    // join the array into one string and return it
    return password.join("");
}