
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

function close () {
    $.index.close();
}

if (OS_IOS && !hideCloseButton) {

    var closeButton = Ti.UI.createButton({
        title: 'Close',
        style: Ti.UI.iPhone.SystemButtonStyle.PLAIN
    });

    closeButton.addEventListener('click', close);

    $.accountView.leftNavButton = closeButton;
}

var addButton = Ti.UI.createButton({title: '+'});

$.accountView.rightNavButton = addButton;

var newAccountController = null;

addButton.addEventListener('click', function() {
    newAccountController = Alloy.createController('newaccount', {accounts: accounts});
    accounts.on('add', onCreatedAccount);
    newAccountController.getView().open();
});

function onCreatedAccount() {
    accounts.off("add", onCreatedAccount);
    renderListOfAccounts();
    newAccountController.getView().close();
}

exports.open = function () {
    $.index.open();
};
