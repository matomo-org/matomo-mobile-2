function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};

var accountModel = require('session').getAccount();
var siteModel    = require('session').getWebsite();

var currentMetric   = null;
// the currently selected report
var reportModel     = args.report || false;
var flatten         = args.flatten || 0;
var reportList      = args.reportList || {};
var reportPeriod    = args.period || 'day';
var reportDate      = args.date || 'today';
var showAllEntries  = false;

// the fetched statistics that belongs to the currently selected report
var statisticsModel = Alloy.createModel('piwikProcessedReport');

var rowsFilterLimit = Alloy.CFG.piwik.filterLimit;

var reportRowsCtrl = null;

if (OS_IOS) {
    $.pullToRefresh.init($.reportTable);
}

function onClose()
{
    $.destroy();
}

/**
 * REPORT-MENU START
 */

function toggleReportConfiguratorVisibility()
{
    require('report/configurator').refresh({website: siteModel.getName()});
    require('report/configurator').toggleVisibility();
}

function onMetricChosen(chosenMetric)
{
    currentMetric = chosenMetric;
    doRefresh();
}

function doChooseDate () 
{
    var params = {date: reportDate, period: reportPeriod};
    require('commands/openDateChooser').execute(params, onDateChosen);
}

function doFlatten () 
{
    flatten = 1;
    doRefresh();
    flatten = 0;
}

function onReportChosen (chosenReportModel) {
    reportModel   = chosenReportModel;
    currentMetric = null;

    doRefresh();
}

function onDateChosen (period, dateQuery)
{
    reportPeriod = period;
    reportDate   = dateQuery;
    doRefresh();
}

function onTogglePaginator()
{
    showAllEntries = !showAllEntries; 
    doRefresh();
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
    $.index.title = processedReportModel.getReportName();
    
    showReportContent();

    if (!processedReportModel) {
        console.error('msising report model');
        return;
    }
    
    $.reportTable.setData([]);

    if ($.reportInfoCtrl) {
        $.reportInfoCtrl.update(processedReportModel);
    }

    $.reportGraphCtrl.update(processedReportModel, accountModel);

    var rows = [];

    var row = Ti.UI.createTableViewRow({height: Ti.UI.SIZE});
    row.add($.reportGraphCtrl.getView());
    rows.push(row);

    var row = Ti.UI.createTableViewRow({height: Ti.UI.SIZE});
    row.add($.reportInfoCtrl.getView());
    rows.push(row);

    if (reportRowsCtrl) {
        reportRowsCtrl.destroy();
    }
    
    _.each(processedReportModel.getRows(), function (report) {
        var reportRow = Alloy.createController('reportrow', report);
        var row = Ti.UI.createTableViewRow({height: Ti.UI.SIZE});
        row.add(reportRow.getView());
        rows.push(row);
        row = null;
    });

     if (rowsFilterLimit <= processedReportModel.getRows().length) {
        // a show all or show less button only makes sense if there are more or equal results than the used
        // filter limit value...
        var row = Ti.UI.createTableViewRow({title: showAllEntries ? L('Mobile_ShowLess') : L('Mobile_ShowAll')});
        row.addEventListener('click', onTogglePaginator);
        rows.push(row);
    }
    
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
        params: {period: reportPeriod, 
                 date: reportDate, 
                 idSite: siteModel.id, 
                 flat: flatten,
                 sortOrderColumn: metric,
                 filter_sort_column: metric,
                 filter_limit: showAllEntries ? -1 : rowsFilterLimit,
                 apiModule: module, 
                 apiAction: action},
        error: function () {
            statisticsModel.trigger('error', {type: 'loadingProcessedReport'});
        },
        success: onStatisticsFetched
    });
}

exports.open = function () {

    onReportChosen(reportModel);

    require('layout').open($.index);
};

exports.refresh = doRefresh;