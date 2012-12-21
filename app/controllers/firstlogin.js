
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
    var webview = {title: 'FAQ', url: 'http://piwik.org/mobile/faq/'};
    var faq     = Alloy.createController('webview', webview)
    faq.open();
}

exports.close = function ()
{
    $.firstlogin.close();
};

exports.open = function ()
{
    $.firstlogin.open(); 
};