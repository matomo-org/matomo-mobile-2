
var args = arguments[0] || {};
var accounts = args.accounts;

var loginform = Alloy.createController('loginform', {
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
    require('alloy').Globals.layout.open($.index);
}