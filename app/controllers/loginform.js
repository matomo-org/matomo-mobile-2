function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};
var accounts = args.accounts || false;

function onUrlReturn () {
	onUrlBlur();
	
	$.username.focus();
}

function onUrlBlur () {
    if ($.url.value && -1 === $.url.value.indexOf('http')) {
        // user has not specified any http protocol. automatically prepend 'http'.
        $.url.value = 'http://' + $.url.value;
    }
}

function onUsernameReturn () {
    $.password.focus();
}

function doLogin()
{
    require('login').login(
        accounts,
        $.url.value,
        $.username.value,
        $.password.value
    );
}