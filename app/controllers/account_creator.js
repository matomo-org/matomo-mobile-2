function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};
var accounts = args.accounts;

var loginform = Alloy.createController('login_form', {
    accounts: accounts
});

$.loginform.add(loginform.getView());

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

exports.open = function () 
{
    require('layout').open($.index);
}

exports.close = function () 
{
    require('layout').close($.index);
    $.destroy();
}