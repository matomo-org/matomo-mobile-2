console.log("Bar");

require("Piwik");
require("Piwik/App/Accounts");

console.log("Foo");

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

/*var configuredAccounts = accounts.getAccounts();
if (configuredAccounts == 0) {
	$.index.open();
}*/
