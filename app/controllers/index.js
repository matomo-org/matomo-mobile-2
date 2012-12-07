require("Piwik");

var accounts =  Alloy.createCollection('AppAccounts');
accounts.fetch();

if (!accounts.length) {
    var firstlogin = Alloy.createController('firstlogin', {accounts: accounts});
    firstlogin.open();
} else {
    var statistics = Alloy.createController('statistics', {accounts: accounts});
    statistics.open()
} 

