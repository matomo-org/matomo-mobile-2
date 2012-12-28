var accounts =  Alloy.createCollection('AppAccounts');
accounts.fetch();

var firstLogin = null;

if (!accounts.length) {

    firstLogin = Alloy.createController('firstlogin', {accounts: accounts});
    accounts.on('add', onCreatedAccount);
    firstLogin.open();

} else {

    showEntryScreen();
}

function showEntryScreen()
{
    var account = accounts.first();

    var preferences = Alloy.createCollection('piwikAccountPreferences');

    preferences.fetchPreferences(account, function (account) {
        if (account.startWithAllWebsitesDashboard()) {
            openDashboard(account);
        } else {
            openEntrySite(account);
        }
    });
}

function openEntrySite(accountModel) 
{
    var site = Alloy.createCollection('PiwikWebsitesById');
    site.fetch({
        params: {idSite: accountModel.entrySiteId()},
        account: accountModel,
        success: function (sites) {
            openStatistics({site: sites.entrySite(), account: accountModel})
        },
        error: function () {
            // TODO what now?
        }
    });
}

function onCreatedAccount() {
    accounts.off("add", onCreatedAccount);

    if (firstLogin) {
        firstLogin.close();
    }

    showEntryScreen();
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