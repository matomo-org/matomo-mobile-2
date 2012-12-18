var accounts =  Alloy.createCollection('AppAccounts');
accounts.fetch();

var firstLogin = null;

if (!accounts.length) {

    firstLogin = Alloy.createController('firstlogin', {accounts: accounts});
    accounts.on('add', onCreatedAccount);
    firstLogin.open();

} else {

    openStatistics();
}

function onCreatedAccount() {
    accounts.off("add", onCreatedAccount);
    if (firstLogin) {
        firstLogin.close();
    }
    openStatistics();
}

function openStatistics()
{
    var alloy      = require('alloy');
    var statistics = Alloy.createController('statistics', {accounts: accounts});

    if (OS_IOS && alloy.isHandheld) {

        alloy.Globals.layout = require('layout/iphone');
        alloy.Globals.layout.bootstrap(statistics);

    } else if (OS_IOS && alloy.isTablet) {

        alloy.Globals.layout = require('layout/ipad');
        alloy.Globals.layout.bootstrap(statistics);

    } else if (OS_MOBILEWEB) {

        alloy.Globals.layout = require('layout/mobileweb');
        alloy.Globals.layout.bootstrap(statistics);

    } else if (OS_ANDROID) {
        alloy.Globals.layout = require('layout/android');
        alloy.Globals.layout.bootstrap(statistics);
    }
}
