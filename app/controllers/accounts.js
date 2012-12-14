
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

function onSelect(event)
{
    var account = accounts.get(event.rowData.id);
    $.trigger('accountChosen', account);
    $.index.close();
}

function onDelete(event)
{
    var account = accounts.get(event.rowData.id);

    if (account) {
        accounts.remove(account);
        account.destroy();
    }
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

exports.open = function () {
    $.index.open();
};
