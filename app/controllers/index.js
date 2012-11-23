require("Piwik");

var Accounts = require("Piwik/App/Accounts");
var acc = new Accounts();

var configuredAccounts = acc.getAccounts();
if (configuredAccounts == 0) {
	$.index.open();
}

function login() 
{
	
	var url      = $.url.value;
	var username = $.username.value;
	var password = $.password.value; 

	console.debug("Login with " + username + " / " + password + " on " + url);
    
    piwik.login(url, username, password);
    
    return;
    Alloy.createController('statistics');
    
}


