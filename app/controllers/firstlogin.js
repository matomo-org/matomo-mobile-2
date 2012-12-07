
var args = arguments[0] || {};
var accounts = args.accounts || false;

var loginform = Alloy.createController('loginform', {
    accounts: accounts
});
$.loginform.add(loginform.getView());

function onTryIt () {
    $.url.value = 'http://demo.piwik.org';
    $.username.value = '';
    $.password.value = '';
    // Call loginform.js
    doLogin();
}

function onFaq () {
	// not yet implemented
}

exports.open = function () {
    $.firstlogin.open(); 
};