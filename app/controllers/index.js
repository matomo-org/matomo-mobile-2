require("Piwik");

var Accounts = require("Piwik/App/Accounts");
var AccountRequest = require("Piwik/Network/AccountRequest");


var acc = new Accounts();

if (acc.hasActivedAccount()) {
	Alloy.createController('statistics');
} else {
	$.index.open();
}

function onUrlReturn () {
    if ($.url.value && -1 === $.url.value.indexOf('http')) {
        // user has not specified any http protocol. automatically prepend 'http'.
        $.url.value = 'http://' + $.url.value;
    }
    
    $.username.focus();
}

function onUsernameReturn () {
    $.password.focus();
}

function login () 
{
	var anonymous = false;
	if ($.username.value && !$.password.value) {
	    anonymous = true;
	}
	
	var newAccount = {
		accessUrl: $.url.value,
		username: $.username.value,
		password: $.password.value,
		anonymous: false,
		name: $.url.value
	};
	
	var request = new AccountRequest();
	
	request.addEventListener("onInvalidUrl", function() {
		alert("onInvalidUrl");
	});
	
	request.addEventListener("onMissingUsername", function() {
		alert("onMissingUsername");
	});

	request.addEventListener("onMissingPassword", function() {
		alert("onMissingPassword");
	});

	request.addEventListener("onReceiveAuthTokenError", function() {
		alert("onReceiveAuthTokenError");
	});
	
	request.addEventListener("onNoViewAccess", function() {
		alert("onNoViewAccess");
	});
	
	request.addEventListener("onload", function() {
        var alertDialog = Ti.UI.createAlertDialog({
            title: _('General_Done'),
            message: _('General_YourChangesHaveBeenSaved'),
            buttonNames: [_('General_Ok')]
        });
        
        alertDialog.addEventListener('click', function () {
            Alloy.createController('statistics');
        });
        
        alertDialog.show();
    });
		
	request.send({account: newAccount});
}

