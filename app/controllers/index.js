
var accounts =  Alloy.createCollection('AppAccounts');
accounts.fetch();

if (!accounts.length) {

    var firstlogin = Alloy.createController('firstlogin', {accounts: accounts});

    accounts.on('add', onCreatedAccount);

    firstlogin.open();

} else {

    var statistics = Alloy.createController('statistics', {accounts: accounts});
    statistics.open()

}

function onCreatedAccount() {
    accounts.off("add", onCreatedAccount);
    var statistics = Alloy.createController('statistics', {accounts: accounts});
    firstlogin.getView().close();
    statistics.open();
}
