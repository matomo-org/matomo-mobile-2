function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};

// a list of all available accounts
var accountsCollection = args.accounts || false;
// the currently selected account
var accountModel       = args.account || false;
// the currently selected website
var siteModel          = args.site || false;
// A list of all available reports
var reportsCollection  = args.reports || false;
// the currently selected report
var reportModel        = null;
// the fetched statistics that belongs to the currently selected report
var statisticsModel    = Alloy.createModel('piwikProcessedReport');

var displayedController = null;

var reportListController = Alloy.createController('availablereports', {reports: reportsCollection,
                                                                       site: siteModel,
                                                                       closeOnSelect: require('alloy').isHandheld});


$.index.setTitle(siteModel.getName());

function doChooseAccount()
{
    var accounts = Alloy.createController('accounts', {accounts: accountsCollection});
    accounts.on('accountChosen', onAccountChosen);
    accounts.open();
}

function doChooseWebsite()
{
    var params   = {account: accountModel, accounts: accountsCollection, autoOpen: false};
    var websites = Alloy.createController('allwebsitesdashboard', params);
    websites.on('websiteChosen', function () {
        this.close();
    });
    websites.on('websiteChosen', onWebsiteChosen)
    websites.open();
}

function doOpenSettings()
{
    var settings = Alloy.createController('settings');
    settings.open();
}

function onClose()
{
    $.destroy();
}

function clearContent()
{
    if (displayedController) {
        $.content.remove(displayedController.getView());
        displayedController.destroy();
        displayedController = null;
    }
}

function displayContent(controller)
{
    clearContent();

    displayedController = controller;
    $.content.add(displayedController.getView());
}

function onReportChosen (chosenReportModel) {
    reportModel   = chosenReportModel;
    // currentMetric = null;

    refreshReport();
}

function refreshReport()
{
    var params = {
        account: accountModel, 
        site: siteModel, 
        report: reportModel,
        statistics: statisticsModel,
        reportList: reportListController,
    };

    var report = Alloy.createController('report', params);
    displayContent(report);
    report.refresh();
}

function onLiveVisitorsChosen()
{
    var params = {account: accountModel, site: siteModel, reportList: reportListController};
    var live   = Alloy.createController('livevisitors', params);
    displayContent(live);
    live.refresh();
}

function onVisitorLogChosen()
{
    var params = {account: accountModel, site: siteModel, reportList: reportListController};
    var live   = Alloy.createController('visitorlog', params);
    displayContent(live);
    live.refresh();
}

function onVisitorMapChosen()
{
    var url = accountModel.getBasePath();
    url    += "index.php?module=Widgetize&action=iframe&widget=1&moduleToWidgetize=UserCountryMap&actionToWidgetize=realtimeMap&idSite=";
    url    += siteModel.id;
    url    += "period=month&date=today&disableLink=1&widget=1";

    var webview = {title: L('Visitor Map'), url: url};
    var map     = Alloy.createController('webview', webview)
    map.open();
}

function onReportListFetched(reportsCollection)
{
    if (!reportModel || !reportsCollection.containsAction(reportModel)) {
        // request statistics using same report if website supports this report
        reportModel = reportsCollection.getEntryReport();
    }

    onReportChosen(reportModel);
}

function onWebsiteChosen(event)
{
    siteModel    = event.site;
    accountModel = event.account;

    $.index.setTitle(siteModel.getName());
    reportListController.updateWebsite(siteModel);

    fetchListOfAvailableReports();
}

function fetchListOfAvailableReports()
{
    reportsCollection.fetch({
        account: accountModel,
        params: {idSites: siteModel.id},
        success : onReportListFetched,
        error : function(model, resp) {
            // TODO what should we do in this case?
            statisticsModel.trigger('error', {type: 'loadingReportList'});
        }
    });
}

function onAccountChosen(account)
{
    accountModel            = account;
    var entrySiteCollection = Alloy.createCollection('piwikWebsites');
    //TODO either display ALL WEBSITES DASHBOARD OR CHOOSE CORRECT WEBSITE
    var entrySite = entrySiteCollection.first();
    entrySiteCollection.fetch({
        params: {limit: 1},
        account: accountModel, 
        success: function (entrySiteCollection) {
            onWebsiteChosen({site: entrySite, account: accountModel});
        }
    });
}

function doRefresh() 
{
    if (displayContent && displayContent.refresh) {
        displayContent.refresh();
    }
}

statisticsModel.on('error', function () {
    // TODO what should we do in this case?
});

reportListController.on('reportChosen', onReportChosen);
reportListController.on('liveVisitorsChosen', onLiveVisitorsChosen);
reportListController.on('visitorLogChosen', onVisitorLogChosen);
reportListController.on('visitorMapChosen', onVisitorMapChosen);


exports.open = function () {

    onWebsiteChosen({site: siteModel, account: accountModel});

    var alloy  = require('alloy');
    var layout = require('layout');

    if (alloy.isTablet) {
        layout.openSplitWindow($.index, $.content, reportListController.getView());
        reportListController.open();
    } else {
        layout.open($.index);
    }
};
