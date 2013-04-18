function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};

var currentMetric   = null;
// the currently selected report
var reportModel     = args.report || false;
var reportList      = args.reportList || {};
var reportDate      = require('session').getReportDate();
var flatten         = 0;
var showAllEntries  = false;

$.index.title = reportModel.getReportName();

// the fetched statistics that belongs to the currently selected report
var processedReports = Alloy.createCollection('piwikProcessedReport');

var rowsFilterLimit = Alloy.CFG.piwik.filterLimit;

var reportRowsCtrl = null;

if (OS_IOS) {
    $.pullToRefresh.init($.reportTable);
}

function registerEvents()
{
    var session = require('session');
    session.on('websiteChanged', onWebsiteChanged);
    session.on('reportDateChanged', onDateChanged);
}

function unregisterEvents()
{
    var session = require('session');
    session.off('websiteChanged', onWebsiteChanged);
    session.off('reportDateChanged', onDateChanged);
}

function onClose()
{
    unregisterEvents();

    $.destroy();
}

function onWebsiteChanged()
{
    doRefresh();
}

function onDateChanged(changedReportDate) 
{
    reportDate = changedReportDate;
    doRefresh();
}

function onMetricChosen(chosenMetric)
{
    currentMetric = chosenMetric;
    doRefresh();
}

function onDateChosen (period, dateQuery)
{
    reportPeriod = period;
    reportDate   = dateQuery;
    doRefresh();
}

function onReportChosen (chosenReportModel) {
    reportModel   = chosenReportModel;
    currentMetric = null;

    doRefresh();
}

function onTogglePaginator()
{
    showAllEntries = !showAllEntries; 
    doRefresh();
}

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

function onStatisticsFetched(processedReportCollection)
{
    var accountModel = require('session').getAccount();
    
    showReportContent();

    if (!processedReportCollection) {
        console.error('msising report model');
        return;
    }
    
    $.reportTable.setData([]);

    if ($.reportInfoCtrl) {
        $.reportInfoCtrl.update(processedReportCollection.first());
    }

    $.reportGraphCtrl.update(processedReportCollection.first(), accountModel);

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
    
    processedReportCollection.forEach(function (processedReport) {
        if (!processedReport) {
            return;
        }
        var reportRow = Alloy.createController('reportrow', processedReport);
        var row = Ti.UI.createTableViewRow({
            height: Ti.UI.SIZE, 
            subtableId: processedReport.getSubtableId()
        });
        row.add(reportRow.getView());
        rows.push(row);
        row = null;
    });

    if (rowsFilterLimit <= processedReportCollection.length) {
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

    var accountModel = require('session').getAccount();
    var siteModel    = require('session').getWebsite();

    var module = reportModel.get('module');
    var action = reportModel.get('action');
    var metric = reportModel.getSortOrder(currentMetric);

    processedReports.fetchProcessedReports(metric, {
        account: accountModel,
        params: {period: reportDate.getPeriodQueryString(), 
                 date: reportDate.getDateQueryString(), 
                 idSite: siteModel.id, 
                 flat: flatten,
                 filter_limit: showAllEntries ? -1 : rowsFilterLimit,
                 apiModule: module, 
                 apiAction: action},
        error: function () {
            processedReports.trigger('error', {type: 'loadingProcessedReport'});
        },
        success: onStatisticsFetched
    });
}

exports.open = function () {

    onReportChosen(reportModel);

    require('layout').open($.index);
};