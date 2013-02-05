var args = arguments[0] || {};

var accountModel    = args.account || false;
// the currently selected website
var siteModel       = args.site || false;
// the currently selected report
var reportModel     = args.report || false;
// the fetched statistics that belongs to the currently selected report
var statisticsModel = args.statistics || false;
var currentMetric   = null;
var flatten         = args.flatten || 0;
var reportList      = args.reportList || {};

var reportRowsCtrl = null;

if (OS_IOS) {
    $.pullToRefresh.init($.reportTable);
}

/**
 * REPORT-MENU START
 */

function doChooseMetric()
{
    var params         = {metrics: statisticsModel.getMetrics()};
    var metricsChooser = Alloy.createController('reportmetricschooser', params);
    metricsChooser.on('metricChosen', onMetricChosen)
    metricsChooser.open();
}

function onMetricChosen(chosenMetric)
{
    currentMetric = chosenMetric;
    doRefresh();
}

function doChooseDate () 
{
    alert('change date');
}

function doFlatten () 
{
    flatten = 1;
    doRefresh();
    flatten = 0;
}

function doChooseReport()
{
    reportList.open();
}

function onReportChosen (chosenReportModel) {
    reportModel   = chosenReportModel;
    currentMetric = null;

    refreshReport();
}

/**
 * REPORT-MENU END
 */

function showReportContent()
{
    if (OS_IOS) {
        $.pullToRefresh.refreshDone();
    } 

    $.loadingindicator.hide();
}

function showLoadingMessage()
{
    if (OS_IOS) {
        $.pullToRefresh.refresh();
    }
    
    $.loadingindicator.show();
}

function onStatisticsFetched(processedReportModel)
{
    showReportContent();
    
    $.reportTable.setData([]);

    $.reportInfoCtrl.update(processedReportModel);
    $.reportGraphCtrl.update(processedReportModel, accountModel);

    var rows = [];

    var row = Ti.UI.createTableViewRow();
    row.add($.reportInfoCtrl.getView());
    rows.push(row);

    var row = Ti.UI.createTableViewRow();
    row.add($.reportGraphCtrl.getView());
    rows.push(row);

    var row = Ti.UI.createTableViewRow();
    row.add($.reportRowSeparator);
    rows.push(row);

    if (reportRowsCtrl) {
        reportRowsCtrl.destroy();
    }
    
    _.each(processedReportModel.getRows(), function (report) {
        var reportRow = Alloy.createController('reportrow', report);
        var row = Ti.UI.createTableViewRow();
        row.add(reportRow.getView());
        rows.push(row);
        row = null;
    });

    $.reportTable.setData(rows);
    row  = null;
    rows = null;
}

function doRefresh()
{
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

exports.refresh = doRefresh;