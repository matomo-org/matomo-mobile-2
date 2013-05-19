/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

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
    var dashboard = Alloy.createController('all_websites_dashboard');
    dashboard.on('websiteChosen', onSiteSelected);
    dashboard.on('websiteChosen', function () {
        this.close();
    });

    dashboard.open();
}

function updateDefaultReportDateInSession(accountModel)
{
    var reportDate = new (require('report/date'));
    reportDate.setReportDate(accountModel.getDefaultReportDate());

    require('session').setReportDate(reportDate);
}

exports.selectWebsite = function (accountModel, callback)
{
    onSiteSelectedCallback = callback;

    accountModel.select(function (account) {
        updateDefaultReportDateInSession(account);
        if (account.startWithAllWebsitesDashboard()) {
            openDashboard(account);
        } else {
            openEntrySite(account);
        }
    });
}