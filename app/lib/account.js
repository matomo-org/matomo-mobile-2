/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var onSiteSelectedCallback = null;
var onFirstWindowOpenedCallback = null;
function openEntrySite(account) 
{
    var entryWebsite = Alloy.createController('entry_website', {account: account});
    entryWebsite.on('accountChosen', onAccountSelected);
    entryWebsite.on('websiteLoaded', onSiteSelected);
    entryWebsite.open();
}

function onSiteSelected(event)
{
    if (!event || !onSiteSelectedCallback) {
        console.log('cannot select site', 'account');
        return;
    }

    onSiteSelectedCallback(event.site, event.account);
}

var firstTime = true;
function openDashboard(account)
{
    var dashboard = Alloy.createController('all_websites_dashboard', {enableGoBack: !firstTime});
    dashboard.on('websiteChosen', onSiteSelected);
    dashboard.on('websiteChosen', function () {
        this.close();
    });

    dashboard.open();
    firstTime = false;
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

function onAccountSelected(accountModel)
{
    setDefaultReportDateIfNeeded(accountModel);

    if (accountModel.startWithAllWebsitesDashboard() || !accountModel.entrySiteId()) {
        openDashboard(accountModel);
    } else {
        openEntrySite(accountModel);
    }
    
    if (onFirstWindowOpenedCallback) { 
        onFirstWindowOpenedCallback();
        onFirstWindowOpenedCallback = null;
    }
}

exports.selectWebsite = function (accountModel, onSuccessCallback, onWindowOpenedCallback)
{
    if (!accountModel) {
        console.log('Cannot select website, no account given', 'account');
        return;
    }

    onSiteSelectedCallback      = onSuccessCallback;
    onFirstWindowOpenedCallback = onWindowOpenedCallback;

    accountModel.select(onAccountSelected);
};