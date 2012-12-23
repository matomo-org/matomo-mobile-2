var accounts =  Alloy.createCollection('AppAccounts');
accounts.fetch();

var firstLogin = null;

if (!accounts.length) {

    firstLogin = Alloy.createController('firstlogin', {accounts: accounts});
    accounts.on('add', onCreatedAccount);
    firstLogin.open();

} else {

    openDashboard();
}

function onCreatedAccount() {
    accounts.off("add", onCreatedAccount);

    if (firstLogin) {
        firstLogin.close();
        // firstLogin.destroy();
    }

    openDashboard();
}

function openDashboard()
{
    var dashboard = Alloy.createController('allwebsitesdashboard', {accounts: accounts});
    dashboard.open();
}