/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
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
        $.url.value = trim(url.addHttpProtocol($.url.value));
    }
}

function onUsernameReturn () 
{
    $.password.focus();
}

function askToUseHttps()
{
    // accessUrl starts with http://
    var alertDialog = Ti.UI.createAlertDialog({
        message: L('Mobile_HttpIsNotSecureWarning'),
        buttonNames: [L('General_Yes'), L('Mobile_LoginUseHttps')]
    });

    alertDialog.show();

    alertDialog.addEventListener('click', function (event) {
        if (!event || (event.cancel === event.index) || (true === event.cancel)) {
            // user pressed hardware back button or cancel button
            return;
        }

        if (1 === event.index) {
            // user pressed 'use secure https' button
            $.url.value = require('url').replaceHttpWithHttps(trim($.url.value));
            login();
        } else if (0 === event.index) {
            login();
        }
        
    });
}

function login()
{
    require('login').login(
        accounts,
        trim($.url.value),
        $.username.value,
        $.password.value
    );
}
function trim(str)
{
    str = str + '';
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

function doLogin()
{
    onUrlBlur();
    
    var url = require('url');

    if ($.url.value && !url.startsWithHttps(trim($.url.value))) {
        askToUseHttps();
    } else {
        login();
    }
}