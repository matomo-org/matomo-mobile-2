var args = arguments[0] || {};

// a list of all available accounts
var accountsCollection = args.accounts || false;
// the currently selected account
var accountModel       = accountsCollection.first();
// the currently selected website
var siteModel          = null;
// A list of all available reports
var reportsCollection  = Alloy.createCollection('piwikReports');
// the currently selected report
var reportModel        = null;
// the fetched statistics that belongs to the currently selected report
var statisticsModel    = Alloy.createModel('piwikProcessedReport');

var currentMetric = null;
var flatten       = 0;

if (OS_IOS) {
    var leftButtons = [
        {image:'ic_action_settings.png', width:32},
        {image:'ic_action_accounts.png', width:32}
    ];
    var bar = Ti.UI.createButtonBar({
        labels: leftButtons,
        backgroundColor: "#B2AEA5"
    });
    
    bar.addEventListener('click', doChooseAccount);
    
    $.win1.leftNavButton = bar;
    
    var websitesButton = Ti.UI.createButton({image:'ic_action_website.png', width:32});
    websitesButton.addEventListener('click', doChooseWebsite);

    $.win1.rightNavButton = websitesButton;
}

function doChooseAccount()
{
    var accounts = Alloy.createController('accounts', {accounts: accountsCollection});
    accounts.on('accountChosen', onAccountChosen);
    accounts.open();
}

function doChooseWebsite()
{
    var websites = Alloy.createController('websites', {account: accountModel});
    websites.on('websiteChosen', onWebsiteChosen)
    websites.open();
}

function doChooseReport()
{
    var params     = {reports: reportsCollection, site: siteModel};
    var reportList = Alloy.createController('availablereports', params);
    reportList.on('reportChosen', onReportChosen)
    reportList.open();
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

function onReportChosen (chosenReportModel) {
    reportModel   = chosenReportModel;
    currentMetric = null;
    refresh();
}

function onMetricChosen(chosenMetric)
{
    currentMetric = chosenMetric;
    refresh();
}

function onWebsiteChosen(site)
{
    siteModel    = site;
    $.win1.title = siteModel.getName();

    reportsCollection.fetch({
        account: accountModel,
        params: {idSites: siteModel.id},
        success : function(reportsCollection) {

            if (!reportModel || !reportsCollection.containsAction(reportModel)) {
                // request statistics using same report if website supports this report
                reportModel = reportsCollection.getEntryReport();
            }

            refresh();
        },
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
    $.content.show();
}

function showLoadingMessage()
{
    $.loading.show();
    $.content.hide();
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

exports.open = function () {
    onAccountChosen(accountModel);

    $.index.open(); 
};
