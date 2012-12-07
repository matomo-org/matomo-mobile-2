require("Piwik");

var accounts =  Alloy.createCollection('AppAccounts');
accounts.fetch();

if (!accounts.length) {
    var firstlogin = Alloy.createController('firstlogin');
    firstlogin.open();
} else {
    require('state').setAccount(accounts.first());
    var statistics = Alloy.createController('statistics');
    statistics.open()
} 

