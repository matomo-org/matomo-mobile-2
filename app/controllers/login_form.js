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

function onUrlReturn () 
{
    onUrlBlur();

    $.username.focus();
}

function onUrlBlur () 
{
    var url = require('url');

    if ($.url.value && !url.startsWithHttp($.url.value)) {
        $.url.value = url.addHttpProtocol($.url.value);
    }
}

function onUsernameReturn () 
{
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