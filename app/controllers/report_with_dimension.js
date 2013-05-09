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
var flatten         = args.flatten || 0;
var showAllEntries  = false;
var shouldScrollToPositionOfPaginator = false;

$.index.title = reportModel.getReportName();

// the fetched statistics that belongs to the currently selected report
var processedReports = Alloy.createCollection('piwikProcessedReport');

var rowsFilterLimit = Alloy.CFG.piwik.filterLimit;

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
    shouldScrollToPositionOfPaginator = showAllEntries;
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

function showReportHasNoData()
{
    var row = Ti.UI.createTableViewRow({
        height: Ti.UI.SIZE, 
        color: '#7e7e7e',
        title: 'No data for this table'
    });

    $.reportTable.setData([row]);
}

function hasReportData(processedReportCollection) {
    return (processedReportCollection && processedReportCollection.length);
}

function renderProcessedReport(processedReportCollection)
{
    var accountModel = require('session').getAccount();
    
    showReportContent();

    $.reportTable.setData([]);

    if (!hasReportData(processedReportCollection)) {
        showReportHasNoData();
        return;
    }

    if ($.reportInfoCtrl) {
        $.reportInfoCtrl.update(processedReportCollection);
    }

    $.reportGraphCtrl.update(processedReportCollection, accountModel);

    var rows = [];

    var settings = Alloy.createCollection('AppSettings').settings();
    if (settings.areGraphsEnabled()) {
        var row = Ti.UI.createTableViewRow({height: Ti.UI.SIZE});
        if (OS_IOS) {
            row.selectionStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.NONE;
        }
        row.add($.reportGraphCtrl.getView());
        rows.push(row);
    }

    var row = Ti.UI.createTableViewRow({height: Ti.UI.SIZE});
    if (OS_IOS) {
        row.selectionStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY;
    }
    row.add($.reportInfoCtrl.getView());
    rows.push(row);

    processedReportCollection.forEach(function (processedReport) {
        if (!processedReport) {
            return;
        }

        var hasSubtable = processedReportCollection.hasSubtable() && processedReport.getSubtableId();

        var reportRow = Alloy.createController('report_row', processedReport);

        var row = Ti.UI.createTableViewRow({
            height: Ti.UI.SIZE, 
            subtableId: processedReport.getSubtableId(),
            subtableAction: processedReportCollection.getActionToLoadSubTables(),
            subtableModule: processedReportCollection.getModule(),
            currentReportName: processedReportCollection.getReportName(),
            currentMetric: processedReportCollection.getSortOrder(),
            hasChild: hasSubtable,
            reportTitle: processedReport.getTitle()
        });

        if (OS_IOS && !hasSubtable) {
            row.selectionStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.NONE;
        } else if (OS_IOS) {
            row.selectionStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY;
        }

        if (hasSubtable) {
            row.addEventListener('click', function () {

                var params = {
                    backButtonTitle: this.currentReportName || L('Mobile_NavigationBack'),
                    flatten: flatten,
                    apiModule: this.subtableModule, 
                    apiAction: this.subtableAction,
                    subtableId: this.subtableId,
                    metric: this.currentMetric,
                    reportTitle: this.reportTitle
                };
            
                var subtableReport = Alloy.createController('report_subtable', params);
                subtableReport.open();
            });
        }

        row.add(reportRow.getView());
        rows.push(row);
        row = null;
    });

    if (rowsFilterLimit <= processedReportCollection.length) {
        // a show all or show less button only makes sense if there are more or equal results than the used
        // filter limit value...
        var row = Ti.UI.createTableViewRow({color: '#336699', title: showAllEntries ? L('Mobile_ShowLess') : L('Mobile_ShowAll')});
        row.addEventListener('click', onTogglePaginator);
        rows.push(row);
    }
    
    $.reportTable.setData(rows);
    row  = null;
    rows = null;

    if (shouldScrollToPositionOfPaginator) {
        $.reportTable.scrollToIndex(rowsFilterLimit);
        shouldScrollToPositionOfPaginator = false;
    }
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
        success: renderProcessedReport
    });
}

exports.open = function () {

    onReportChosen(reportModel);

    require('layout').open($.index);
};