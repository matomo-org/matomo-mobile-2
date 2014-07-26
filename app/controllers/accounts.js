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

var accounts = Alloy.Collections.appAccounts;

function chooseAccount(event)
{
    if (!event || !event.row || _.isNull(event.row.accountId) || _.isUndefined(event.row.accountId)) {
        console.info('Cannot select account, there is no accountId', 'accounts::chooseAccount');
        return;
    }

    require('Piwik/Tracker').trackEvent({category: 'Accounts', name: 'Account selected'});

    var account = accounts.get(event.row.accountId);

    if (!account) {
        console.info('Cannot select account, account does not exist', 'accounts::chooseAccount');
    }

    account.select(function (accountModel) {
        $.trigger('accountChosen', accountModel);
    });
}

function deleteAccount(event)
{
    if (!event || !event.row) {
        console.log('cannot delete account, row not defined');
        return;
    }

    var account = accounts.get(event.row.accountId);

    if (!account) {
        console.log('cannot delete account, account not found');
        return;
    }

    var currentActiveAccount = require('session').getAccount();
    if (currentActiveAccount && currentActiveAccount.isSameAccount(account)) {
        require('session').setWebsite(null, null);
    } 

    if (account) {
        accounts.remove(account);
        account.destroy();
    }

    displayNoAccountSelectedHintIfNoAccountIsSelected();

    require('Piwik/Tracker').trackEvent({name: 'Account Delete', category: 'Accounts'});
}

function deleteAccountIfUserConfirmsButNotOniOS(event)
{
    if (OS_IOS) {
        return;
    }

    var dialog = Ti.UI.createAlertDialog({
        cancel: 1,
        buttonNames: [L('General_Yes'), L('General_No')],
        selectedIndex: 1,
        destructive: 0,
        title: L('Mobile_ConfirmRemoveAccount')
    });

    dialog.addEventListener('click', function (clickEvent) {
        if (!clickEvent || 
            clickEvent.cancel === clickEvent.index || 
            true === clickEvent.cancel) {

            return;
        }

        deleteAccount(event);
    });

    dialog.show();
}

function isAnAccountSelected()
{
    return !!require('session').getAccount();
}

$.showNoAccountSelectedHint = function ()
{
    if (OS_MOBILEWEB) {
        $.noAccountSelectedContainer.height = Ti.UI.SIZE;
    }

    if (OS_ANDROID) {
        $.noAccountSelectedLabel.height = Ti.UI.SIZE;
        $.noAccountSelectedLabel.show();
        $.noAccountSelectedContainer.height = Ti.UI.SIZE;
    }

    $.noAccountSelectedContainer.show();
};

function displayNoAccountSelectedHintIfNoAccountIsSelected()
{
    if (!isAnAccountSelected()) {
        $.showNoAccountSelectedHint();
    } 
}

var newAccountController = null;

function addAccount()
{
    require('Piwik/Tracker').trackEvent({category: 'Accounts', name: 'Add Account'});

    newAccountController = Alloy.createController('account_creator', {accounts: accounts});
    accounts.on('add', onCreatedAccount);
    newAccountController.open();
}

function onCreatedAccount() {
    require('Piwik/Tracker').trackEvent({category: 'Accounts', action: 'result', name: 'Account created'});

    accounts.off("add", onCreatedAccount);
    newAccountController.close();
}

function toggleReportChooserVisibility(event)
{
    require('report/chooser').toggleVisibility();

    require('Piwik/Tracker').trackEvent({name: 'Toggle Report Chooser', category: 'Accounts'});
}

function onOpen()
{
    require('Piwik/Tracker').trackWindow('Accounts', 'accounts');
}

function onClose ()
{
    if (OS_ANDROID && $.accountsTable) {
        // this prevents leaking tableViewRows
        $.accountsTable.setData([]);
    }

    $.destroy();
    $.off();
}

function close () 
{
    require('layout').close($.index);
}

exports.open = function ()
{
    displayNoAccountSelectedHintIfNoAccountIsSelected();

    require('layout').open($.index);

    accounts.fetch();
};

exports.close = close;
