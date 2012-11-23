require("Piwik");

var Accounts = require("Piwik/App/Accounts");
var acc = new Accounts();

if (acc.hasActivedAccount()) {
	Alloy.createController('statistics');
} else {
	$.index.open();
}

function login() 
{
	
	console.debug(
		"Creating account with " 
		+ $.username.value 
		+ " / " 
		+ $.password.value 
		+ " on " 
		+ $.url.value
	);
	
	var newAccount = {
		accessUrl: $.url.value,
		username: $.username.value,
		tokenAuth: $.password.value
	};
	
	var id = acc.createAccount(newAccount);
    
    if (id == null) {
    	
    	console.debug("Could not create account");
    	
    } else {
    	
    	console.debug("Account created with id " + id);
    	Alloy.createController('statistics');
    	
    } 
    
}


