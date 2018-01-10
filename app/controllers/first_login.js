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

function onClose()
{
    $.destroy();
    $.off();
}

var args     = arguments[0] || {};
var accounts = Alloy.Collections.appAccounts;

var loginform = Alloy.createController('login_form', {accounts: accounts});

var accountCreatorFooter = Alloy.createController('account_creator_footer', {
    accounts: accounts
});

$.loginform.add(loginform.getView());
$.content.add(accountCreatorFooter.getView());



function onOpen()
{
    require('Piwik/Tracker').trackWindow('First Login', 'first-login');
}

exports.close = function ()
{
    require('layout').close($.index);
};

exports.open = function ()
{
    require('layout').open($.index);
};