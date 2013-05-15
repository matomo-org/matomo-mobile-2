var accounts = Alloy.Collections.appAccounts;
accounts.fetch();

var firstLogin = null;

if (accounts.hasAccount()) {

    showEntryScreen(accounts.lastUsedAccount());

} else {

    firstLogin = Alloy.createController('first_login');
    accounts.on('add', onCreatedAccount);
    firstLogin.open();
}

(function () {
    var Rating = require('Piwik/App/Rating');
    var rating = new Rating();
    rating.countLaunch();
})();

(function () {
    if (!Ti.App.Properties.hasProperty('asked_for_tracking_permission')) {
        require('Piwik/Tracker').askForPermission();

        Ti.App.Properties.setInt('asked_for_tracking_permission', 1);
    }
})();

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
    require('session').setWebsite(siteModel, accountModel);
    
    var reportChooser = Alloy.createController('report_chooser');
    reportChooser.open();
}