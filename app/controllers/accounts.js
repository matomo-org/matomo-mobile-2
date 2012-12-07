require("Piwik");

var args = arguments[0] || {};
var hideCloseButton = args.hideCloseButton || false;

var accounts =  Alloy.createCollection('AppAccounts');

accounts.on('fetch', function() {
    updateContent(accounts);
});

accounts.fetch();

function updateContent(accounts)
{
    var rows = [];
    accounts.map(function(account) {
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
    require('state').setAccount(account);

    // TODO Find a way to reuse the parent controller
    Alloy.createController('statistics');
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

addButton.addEventListener('click', function() {

    Alloy.createController('newaccount', {accounts: accounts});

});

$.index.open();
