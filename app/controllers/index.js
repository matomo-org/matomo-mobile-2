/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

(function () {

    function updateReportDate()
    {
        var settings = Alloy.createCollection('AppSettings').settings();
        if (settings.getReportDate() && settings.getReportPeriod()) {
            var piwikDate = new (require('report/date'));
            piwikDate.setDate(settings.getReportDate());
            piwikDate.setPeriod(settings.getReportPeriod());
            require('session').setReportDate(piwikDate);
        }
    }

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

    if (Alloy.isTablet) {
        Alloy.createController('report_chooser').open();
    }

    require('layout').startRecordingWindows();
    Alloy.createController('report_composite').open();
}