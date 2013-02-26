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

function showEntryScreen(account)
{
    account.select(function (account) {
        if (account.startWithAllWebsitesDashboard()) {
            openDashboard(account);
        } else {
            openEntrySite(account);
        }
    });
}

function openEntrySite(account) 
{
    var entrySiteId = account.entrySiteId();
    var site        = Alloy.createCollection('PiwikWebsitesById');
    site.fetch({
        params: {idSite: entrySiteId},
        account: account,
        success: function (sites) {
            openStatistics({site: sites.entrySite(), account: account})
        },
        error: function () {
            // TODO what now?
        }
    });
}

function onCreatedAccount(account) {
    accounts.off("add", onCreatedAccount);

    showEntryScreen(account);
    
    if (firstLogin) {
        firstLogin.close();
    }

}

function openStatistics(event)
{
    var siteModel = event.site;
    var account   = event.account;

    var reportsCollection = Alloy.createCollection('piwikReports');

    var statistics = Alloy.createController('statistics', {accounts: accounts,
                                                           account: account,
                                                           reports: reportsCollection,
                                                           site: siteModel});

    statistics.open();
}

function openDashboard(account)
{
    var dashboard = Alloy.createController('allwebsitesdashboard', {accounts: accounts,
                                                                    account: account});
    dashboard.on('websiteChosen', openStatistics);
    dashboard.on('websiteChosen', function () {
        this.close();
    });

    dashboard.open();
}