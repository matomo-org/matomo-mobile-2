function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};
var hideCloseButton = args.hideCloseButton || false;
var accounts = Alloy.Collections.appAccounts;

renderListOfAccounts();

function renderListOfAccounts()
{
    var rows = [];
    accounts.forEach(function(account) {
        rows.push(Ti.UI.createTableViewRow({
            title : account.get("name"),
            accountId : account.id
        }));
    });

    $.accounts.setData(rows);
    rows = null;
}

function doSelectAccount(event)
{
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
        renderListOfAccounts();
    });

    dialog.show();
}

var newAccountController = null;

function doAddAccount()
{
    newAccountController = Alloy.createController('account_creator', {accounts: accounts});
    accounts.on('add', onCreatedAccount);
    newAccountController.open();
}

function onCreatedAccount() {
    accounts.off("add", onCreatedAccount);
    renderListOfAccounts();
    newAccountController.close();
}

function toggleReportChooserVisibility(event)
{
    require('report/chooser').toggleVisibility();
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
