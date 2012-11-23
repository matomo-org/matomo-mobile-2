require("Piwik");

var Accounts = require("Piwik/App/Accounts");
var AccountRequest = require("Piwik/Network/AccountRequest");


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
		password: $.password.value,
		anonymous: false,
		name: $.url.value
	};
	
	var request = new AccountRequest();
	
	request.addEventListener("onInvalidUrl", function() {
		console.debug("onInvalidUrl");
	});
	
	request.addEventListener("onMissingUsername", function() {
		console.debug("onMissingUsername");
	});

	request.addEventListener("onMissingPassword", function() {
		console.debug("onMissingPassword");
	});

	request.addEventListener("onReceiveAuthTokenError", function() {
		console.debug("onReceiveAuthTokenError");
	});
	
	request.addEventListener("onNoViewAccess", function() {
		console.debug("onNoViewAccess");
	});
	
	request.addEventListener("onload", function() {
		console.debug("onload");
	});
		
	request.send({account: newAccount}); 
    
}


