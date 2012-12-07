require("Piwik");

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