function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};

// the currently selected report
var reportAction   = args.apiAction || '';
var reportModule   = args.apiModule || '';
var subtableId     = args.subtableId || '';
var flatten        = args.flatten || 0;
var currentMetric  = args.metric;
var reportDate     = require('session').getReportDate();
var showAllEntries = false;
var shouldScrollToPositionOfPaginator = false;

$.index.title = args.reportTitle || '';
$.index.backButtonTitle = args.backButtonTitle;

// the fetched statistics that belongs to the currently selected report
var processedReports = Alloy.createCollection('piwikProcessedReport');

var rowsFilterLimit = Alloy.CFG.piwik.filterLimit;

var reportRowsCtrl = null;

if (OS_IOS) {
    $.pullToRefresh.init($.reportTable);
}

function trackWindowRequest()
{
    var uniqueId = reportModule + '_' + reportAction;
    
    require('Piwik/Tracker').setCustomVariable(1, 'reportModule', reportModule, 'page');
    require('Piwik/Tracker').setCustomVariable(2, 'reportAction', reportAction, 'page');
    require('Piwik/Tracker').setCustomVariable(3, 'reportUniqueId', uniqueId, 'page');
    require('Piwik/Tracker').setCustomVariable(4, 'reportMetric', currentMetric, 'page');

    require('Piwik/Tracker').trackWindow('Report Subtable', 'report/subtable');
}

function onOpen()
{
    trackWindowRequest();
}

function onClose()
{
    $.destroy();
}

function onMetricChosen(chosenMetric)
{
    require('Piwik/Tracker').trackEvent({title: 'Metric Changed', url: '/report/subtable/change/metric/' + chosenMetric});

    currentMetric = chosenMetric;
    doRefresh();
}

function onTogglePaginator()
{
    require('Piwik/Tracker').trackEvent({title: 'Toggle Paginator', url: '/report/subtable/toggle/paginator'});

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
        $.reportInfoCtrl.update(processedReportCollection);
    }

    $.reportGraphCtrl.update(processedReportCollection, accountModel);

    var rows = [];

    var row = Ti.UI.createTableViewRow({height: Ti.UI.SIZE});
    if (OS_IOS) {
        row.selectionStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.NONE;
    }
    row.add($.reportGraphCtrl.getView());
    rows.push(row);

    var row = Ti.UI.createTableViewRow({height: Ti.UI.SIZE});
    if (OS_IOS) {
        row.selectionStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY;
    }
    row.add($.reportInfoCtrl.getView());
    rows.push(row);

    if (reportRowsCtrl) {
        reportRowsCtrl.destroy();
    }
    
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
            hasChild: hasSubtable
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
                    subtableId: this.subtableId
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
        if (OS_MOBILEWEB) row.left = 10;
        
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

    processedReports.fetchProcessedReports(currentMetric, {
        account: accountModel,
        params: {period: reportDate.getPeriodQueryString(), 
                 date: reportDate.getDateQueryString(), 
                 idSite: siteModel.id, 
                 idSubtable: subtableId,
                 flat: flatten,
                 filter_limit: showAllEntries ? -1 : rowsFilterLimit,
                 apiModule: reportModule, 
                 apiAction: reportAction},
        error: function () {
            processedReports.trigger('error', {type: 'loadingProcessedReport'});
        },
        success: onStatisticsFetched
    });
}

exports.open = function () {

    doRefresh();

    require('layout').open($.index);
};