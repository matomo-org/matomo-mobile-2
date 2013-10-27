/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function updateReportDate()
{
    var settings  = Alloy.createCollection('AppSettings').settings();
    var piwikDate = new (require('report/date'));

    if (settings.hasReportDate()) {
        piwikDate.setDate(settings.getReportDate());
        piwikDate.setPeriod(settings.getReportPeriod());
    } else {
        console.warn('There is no reportDate & reportPeriod setting yet, using fallback.');
        // fallback in case no setting exists yet just to make sure we always have a report date.
        // Do not set the period/date setting here, the default report date of the first added account will be used.
        // See #4083.
        piwikDate.setReportDate(Alloy.CFG.account.defaultReportDate);
    }

    require('session').setReportDate(piwikDate);
}

(function () {
    var settings = Alloy.createCollection('AppSettings').settings();
    settings.on('change:reportDate', updateReportDate);

    updateReportDate();
})();

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
}

function showEntryScreen(account)
{
    require('account').selectWebsite(account, openStatistics, function () {
        if (firstLogin) {
            firstLogin.close();
            firstLogin = null;
        }
    });
}

function openStatistics(siteModel, accountModel)
{
    require('session').setWebsite(siteModel, accountModel);

    if (Alloy.isTablet) {
        Alloy.createController('report_chooser').open();
    }

    require('layout').startRecordingWindows();
    Alloy.createController('report_composite').open();
}