var accounts =  Alloy.createCollection('AppAccounts');
accounts.fetch();

var firstLogin = null;

if (accounts.hasAccount()) {

    showEntryScreen(accounts.lastUsedAccount());

} else {

    firstLogin = Alloy.createController('firstlogin', {accounts: accounts});
    accounts.on('add', onCreatedAccount);
    firstLogin.open();
}

function onCreatedAccount(account) 
{
    accounts.off("add", onCreatedAccount);

    showEntryScreen(account);
    
    if (firstLogin) {
        firstLogin.close();
    }
}

function showEntryScreen(account)
{
    require('account').selectWebsite(account, openStatistics);
}

function openStatistics(siteModel, accountModel)
{
    var reportListController = Alloy.createController('availablereports', {accounts: accounts,
                                                                           account: accountModel,
                                                                           site: siteModel});
    reportListController.open();
}