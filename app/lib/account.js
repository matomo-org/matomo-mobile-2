/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var onSiteSelectedCallback = null;

function openEntrySite(account) 
{
    if (!account) {
        console.warn('Cannot open entry site, no account given', 'account');
        return;
    }

    var entrySiteId = account.entrySiteId();
    var site        = Alloy.createCollection('PiwikWebsitesById');
    site.fetch({
        params: {idSite: entrySiteId},
        account: account,
        success: function (sites) {
            if (!sites) {
                console.warn('Failed to fetch entry site', 'account');
                return;
            }

            onSiteSelected({site: sites.entrySite(), account: account});
            account = null;
        },
        error: function (undefined, error) {
            if (error && error.getError) {

               var L      = require('L');
               var dialog = Ti.UI.createAlertDialog({title: error.getError(), message: error.getMessage(), buttonNames: [L('Mobile_Refresh')]});
               dialog.addEventListener('click', function () { openEntrySite(account);account = null; });
               dialog.show();
               dialog = null;

            }
        }
    });
}

function onSiteSelected(event)
{
    if (!event || !onSiteSelectedCallback) {
        console.log('cannot select site', 'account');
        return;
    }

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

function setDefaultReportDateIfNeeded(account)
{
    // see #4083
    var settings = Alloy.createCollection('AppSettings').settings();

    if (!settings.hasReportDate()) {
        var reportDate = new (require('report/date'));
        reportDate.setReportDate(account.getDefaultReportDate());

        settings.setReportDateAndPeriod(reportDate.getPeriod(), reportDate.getDate());
        settings.save();
    }
}

exports.selectWebsite = function (accountModel, callback)
{
    if (!accountModel) {
        console.log('Cannot select website, no account given', 'account');
        return;
    }

    onSiteSelectedCallback = callback;

    accountModel.select(function (account) {
        setDefaultReportDateIfNeeded(account);

        if (account.startWithAllWebsitesDashboard() || !account.entrySiteId()) {
            openDashboard(account);
        } else {
            openEntrySite(account);
        }
    });
};