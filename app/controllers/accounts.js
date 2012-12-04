
var accounts =  Alloy.createCollection('AppAccounts');
accounts.fetch();

var rows = [], len = accounts.length;

accounts.map(function(account) {
    rows.push(Ti.UI.createTableViewRow({
        title : account.get("name"),
        id : account.id
    }));
});

$.accounts.setData(rows);

/*
 * TODO: Button is not displayed in iOS simulator
 */
if (OS_IOS) {

    var closeButton = Ti.UI.createButton({
        title: 'Close',
        style: Ti.UI.iPhone.SystemButtonStyle.PLAIN
    });

    closeButton.addEventListener('click', function(){
        $.index.close();
    });

    $.index.leftNavButton = closeButton;

}


$.index.open();
