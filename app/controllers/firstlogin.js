function L(key)
{
    return require('L')(key);
}

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
    require('commands/openFaq').execute();
}

exports.close = function ()
{
    require('layout').close($.index);
    $.destroy();
};

exports.open = function ()
{
    require('layout').open($.index);
};