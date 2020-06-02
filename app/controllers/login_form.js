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

function hideElement(element) {
    element.hide();
    if (OS_IOS) {
        element.old_height = element.height;
        element.height = 0;
    }
}

function showElement(element, height) {
    element.show();
    if (OS_IOS) {
        element.height = element.old_height;
    }
}

function showAppSpecificLogin() {
    hideElement($.username);
    hideElement($.password);
    hideElement($.usernameLine);
    hideElement($.appSpecificLoginNotice);
    showElement($.usernameLoginNotice);
    showElement($.appSpecificToken);
}

function showUsernameSpecificLogin() {
    hideElement($.usernameLoginNotice);
    hideElement($.appSpecificToken);
    showElement($.appSpecificLoginNotice);
    showElement($.usernameLine);
    showElement($.username);
    showElement($.password);
}

if (OS_IOS) {
    hideElement($.usernameLoginNotice);
    hideElement($.appSpecificToken);
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
    var username = $.username.value;
    var password = $.password.value;
    var tokenAuth = '';

    if ($.appSpecificToken.visible) {
        username = '';
        password = '';
        tokenAuth = $.appSpecificToken.value;
    }

    require('login').login(
        accounts,
        trim($.url.value),
        username,
        password,
        tokenAuth
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