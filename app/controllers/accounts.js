
var args = arguments[0] || {};
var hideCloseButton = args.hideCloseButton || false;
var accounts  = args.accounts || false;

updateContent();

function updateContent()
{
    var rows = [];
    accounts.forEach(function(account) {
        rows.push(Ti.UI.createTableViewRow({
            title : account.get("name"),
            id : account.id
        }));
    });

    $.accounts.setData(rows);
}

$.accounts.on('click', function(e) {
    var account = accounts.get(e.rowData.id);
    selectAccount(account);
});

function selectAccount(account)
{
    $.index.close();
    accounts.trigger('select', account);
}

if (OS_IOS && !hideCloseButton) {

    var closeButton = Ti.UI.createButton({
        title: 'Close',
        style: Ti.UI.iPhone.SystemButtonStyle.PLAIN
    });

    closeButton.addEventListener('click', function(){
        $.index.close();
    });

    $.accountView.leftNavButton = closeButton;

}

var addButton = Ti.UI.createButton({
    title: '+'
});

$.accountView.rightNavButton = addButton;

var newAccountController = null;

addButton.addEventListener('click', function() {
    newAccountController = Alloy.createController('newaccount', {accounts: accounts});
    accounts.on('add', onCreatedAccount);
    newAccountController.getView().open();
});

function onCreatedAccount() {
    accounts.off("add", onCreatedAccount);
    updateContent();
    newAccountController.getView().close();
}

$.index.open();
