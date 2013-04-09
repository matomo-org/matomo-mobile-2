var onSiteSelectedCallback = null;

function openEntrySite(account) 
{
    var entrySiteId = account.entrySiteId();
    var site        = Alloy.createCollection('PiwikWebsitesById');
    site.fetch({
        params: {idSite: entrySiteId},
        account: account,
        success: function (sites) {
            onSiteSelected({site: sites.entrySite(), account: account})
        },
        error: function () {
            // TODO what now?
        }
    });
}

function onSiteSelected(event)
{
    onSiteSelectedCallback(event.site, event.account);
}

function openDashboard(account)
{
    var dashboard = Alloy.createController('allwebsitesdashboard');
    dashboard.on('websiteChosen', onSiteSelected);
    dashboard.on('websiteChosen', function () {
        this.close();
    });

    dashboard.open();
}

exports.selectWebsite = function (accountModel, callback)
{
    onSiteSelectedCallback = callback;

    accountModel.select(function (account) {
        if (account.startWithAllWebsitesDashboard()) {
            openDashboard(account);
        } else {
            openEntrySite(account);
        }
    });
}