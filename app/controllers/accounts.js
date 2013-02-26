function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};
var hideCloseButton = args.hideCloseButton || false;
var accounts  = args.accounts || false;

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

    if (account) {
        accounts.remove(account);
        account.destroy();
    }
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
    newAccountController = Alloy.createController('newaccount', {accounts: accounts});
    accounts.on('add', onCreatedAccount);
    newAccountController.open();
}

function onCreatedAccount() {
    accounts.off("add", onCreatedAccount);
    renderListOfAccounts();
    newAccountController.close();
}

function close () 
{
    require('layout').close($.index);
    $.destroy();
}

exports.open = function ()
{
    require('layout').open($.index);
};
