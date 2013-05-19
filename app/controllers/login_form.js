/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

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
    onUrlBlur();

    require('login').login(
        accounts,
        $.url.value,
        $.username.value,
        $.password.value
    );
}