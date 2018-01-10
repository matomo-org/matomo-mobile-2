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
var accounts = args.accounts;

var loginform = Alloy.createController('login_form', {
    accounts: accounts
});

var accountCreatorFooter = Alloy.createController('account_creator_footer', {
    accounts: accounts
});

$.loginform.add(loginform.getView());
$.index.add(accountCreatorFooter.getView());

function onOpen()
{
    require('Piwik/Tracker').trackWindow('Create Account', 'account-create');
}

function onClose()
{
    $.destroy();
    $.off();
}

function open() 
{
    require('layout').open($.index);
}

function close() 
{
    require('layout').close($.index);
}

exports.open  = open;
exports.close = close;