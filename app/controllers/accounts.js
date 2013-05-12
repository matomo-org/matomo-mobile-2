function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};
var hideCloseButton = args.hideCloseButton || false;
var accounts = Alloy.Collections.appAccounts;
accounts.fetch();

function doSelectAccount(event)
{
    require('Piwik/Tracker').trackEvent({title: 'Accounts - Account selected', url: '/accounts/account-selected'});

    var account = accounts.get(event.rowData.accountId);
    account.select(function () {
        $.trigger('accountChosen', account);
        close();
    });
}

function doDeleteAccount(event)
{
    var account = accounts.get(event.rowData.accountId);

    // TODO this will result in an error cause other windows will no longer get an account
    // var currentActiveAccount = require('session').getAccount();
    // if (account == currentActiveAccount) {
    //     require('session').setWebsite(null, null);
    // }

    if (account) {
        accounts.remove(account);
        account.destroy();
    }

    require('Piwik/Tracker').trackEvent({title: 'Accounts - Account Delete', url: '/accounts/account-deleted'});
    
    // TODO if no further account is available, we will run into problems...
}

function doSelectAction(event)
{
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

        doDeleteAccount(event);
    });

    dialog.show();
}

var newAccountController = null;

function doAddAccount()
{
    require('Piwik/Tracker').trackEvent({title: 'Accounts - Add Account', url: '/accounts/add-account'});

    newAccountController = Alloy.createController('account_creator', {accounts: accounts});
    accounts.on('add', onCreatedAccount);
    newAccountController.open();
}

function onCreatedAccount() {
    require('Piwik/Tracker').trackEvent({title: 'Accounts - Account created', url: '/accounts/account-created'});

    accounts.off("add", onCreatedAccount);
    newAccountController.close();
}

function toggleReportChooserVisibility(event)
{
    require('report/chooser').toggleVisibility();

    require('Piwik/Tracker').trackEvent({title: 'Toggle Report Chooser', url: '/accounts/toggle/report-chooser'});
}

function onOpen()
{
    require('Piwik/Tracker').trackWindow('Accounts', 'accounts');
}

function onClose ()
{
    $.destroy();
}

function close () 
{
    require('layout').close($.index);
}

exports.open = function ()
{
    require('layout').open($.index);
};

exports.close = close;
