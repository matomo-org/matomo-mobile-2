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

function openStatistics(event)
{
    var siteModel = event.site;
    var account   = event.account;
    // A list of all available reports
    var reportsCollection = Alloy.createCollection('piwikReports');

    var statistics = Alloy.createController('statistics', {accounts: accounts,
                                                           account: account,
                                                           reports: reportsCollection,
                                                           site: siteModel});

    statistics.open();
}

function openDashboard()
{
    var dashboard = Alloy.createController('allwebsitesdashboard', {accounts: accounts,
                                                                    account: accounts.first()});
    dashboard.on('websiteChosen', openStatistics);
    dashboard.on('websiteChosen', function () {
        this.close();
    });
    dashboard.open();
}