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
var accounts = args.accounts;

var loginform = Alloy.createController('login_form', {
    accounts: accounts
});

$.loginform.add(loginform.getView());

function onOpen()
{
    require('Piwik/Tracker').trackWindow('Create Account', 'account-create');
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