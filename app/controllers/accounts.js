
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
            id : account.id
        }));
    });

    $.accounts.setData(rows);
    rows = null;
}

function doSelectAccount(event)
{
    var account = accounts.get(event.rowData.id);
    $.trigger('accountChosen', account);
    close();
}

function doDeleteAccount(event)
{
    var account = accounts.get(event.rowData.id);

    if (account) {
        accounts.remove(account);
        account.destroy();
    }
}

function doAddAccount()
{
    newAccountController = Alloy.createController('newaccount', {accounts: accounts});
    accounts.on('add', onCreatedAccount);
    newAccountController.open();
}

var addButton = Ti.UI.createButton({title: '+'});

$.index.rightNavButton = addButton;

var newAccountController = null;

addButton.addEventListener('click', doAddAccount);

function onCreatedAccount() {
    accounts.off("add", onCreatedAccount);
    renderListOfAccounts();
    newAccountController.getView().close();
}

function close () 
{
    require('alloy').Globals.layout.close($.index);
    $.destroy();
}

exports.open = function ()
{
    require('alloy').Globals.layout.open($.index);
};
