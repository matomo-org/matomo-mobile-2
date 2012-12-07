require("Piwik");

function onTryIt () {
    $.url.value = 'http://demo.piwik.org';
    $.username.value = '';
    $.password.value = '';
    login();
}

function onFaq () {
	// not yet implemented
}

exports.open = function () {
    $.firstlogin.open(); 
};