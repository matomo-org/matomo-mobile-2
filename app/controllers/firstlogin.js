
var args = arguments[0] || {};
var accounts = args.accounts || false;

var loginform = Alloy.createController('loginform', {
    accounts: accounts
});
$.loginform.add(loginform.getView());

function onTryIt ()
{
    require('login').login(
        accounts,
        'http://demo.piwik.org',
        '',
        ''
    );
}

function onFaq ()
{
	// not yet implemented
}

exports.open = function ()
{
    $.firstlogin.open(); 
};