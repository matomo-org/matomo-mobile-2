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


var reportListController = Alloy.createController('availablereports', {reports: reportsCollection,
                                                                       site: siteModel,
                                                                       closeOnSelect: require('alloy').isHandheld});

var currentMetric = null;
var flatten       = 0;

$.index.setTitle(siteModel.getName());

function doChooseAccount()
{
    var accounts = Alloy.createController('accounts', {accounts: accountsCollection});
    accounts.on('accountChosen', onAccountChosen);
    accounts.open();
}

function doChooseWebsite()
{
    var websites = Alloy.createController('allwebsitesdashboard', {account: accountModel, accounts: accountsCollection});
    websites.on('websiteChosen', function () {
        this.close();
    });
    websites.on('websiteChosen', onWebsiteChosen)
    websites.open(false);
}

function doChooseReport()
{
    reportListController.open();
}

function doChooseMetric()
{
    var params         = {metrics: statisticsModel.getMetrics()};
    var metricsChooser = Alloy.createController('reportmetricschooser', params);
    metricsChooser.on('metricChosen', onMetricChosen)
    metricsChooser.open();
}

function doChooseDate () 
{
    alert('change date');
}

function doFlatten () 
{
    flatten = 1;
    refresh();
    flatten = 0;
}

exports.onReportChosen = function (chosenReportModel) {
    reportModel   = chosenReportModel;
    currentMetric = null;
    refresh();
}

function onMetricChosen(chosenMetric)
{
    currentMetric = chosenMetric;
    refresh();
}

function onReportListFetched(reportsCollection)
{
    if (!reportModel || !reportsCollection.containsAction(reportModel)) {
        // request statistics using same report if website supports this report
        reportModel = reportsCollection.getEntryReport();
    }

    refresh();
}

function onWebsiteChosen(event)
{
    siteModel    = event.site;
    accountModel = event.account;

    $.index.setTitle(siteModel.getName());

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
    entrySiteCollection.fetch({
        params: {limit: 1},
        account: accountModel, 
        success: function (entrySiteCollection) {
            onWebsiteChosen(entrySiteCollection.getEntrySite());
        }
    });
}

var reportRowsCtrl = null;
function onStatisticsFetched(processedReportModel)
{
    showReportContent();

    $.reportInfoCtrl.update(processedReportModel);
    $.reportGraphCtrl.update(processedReportModel, accountModel);

    if (reportRowsCtrl) {
        $.reportRowsContainer.remove(reportRowsCtrl.getView());
    }

    reportRowsCtrl = Alloy.createController('reportrows', {report: processedReportModel});
    $.reportRowsContainer.add(reportRowsCtrl.getView());
}

function showReportContent()
{
    $.loading.hide();
}

function showLoadingMessage()
{
    $.loading.show();
}

function refresh() {

    showLoadingMessage();

    var module = reportModel.get('module');
    var action = reportModel.get('action');
    var metric = reportModel.getSortOrder(currentMetric);

    statisticsModel.setSortOrder(metric);
    
    statisticsModel.fetch({
        account: accountModel,
        params: {period: 'day', 
                 date: 'today', 
                 idSite: siteModel.id, 
                 flat: flatten,
                 sortOrderColumn: metric,
                 filter_sort_column: metric,
                 apiModule: module, 
                 apiAction: action},
        error: function () {
            statisticsModel.trigger('error', {type: 'loadingProcessedReport'});
        },
        success: onStatisticsFetched
    });
}

statisticsModel.on('error', function () {
    // TODO what should we do in this case?
    showReportContent();
});

reportListController.on('reportChosen', exports.onReportChosen);

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
