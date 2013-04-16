function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};

var currentMetric = null;
var reportModel   = args.report || false;
var reportList    = args.reportList || {};
var reportDate    = require('session').getReportDate();

// the fetched statistics that belongs to the currently selected report
var statisticsModel = Alloy.createModel('piwikProcessedReport');

var reportRowsCtrl = null;

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

function showReportContent()
{
    $.loadingindicator.hide();
}

function showLoadingMessage()
{
    $.loadingindicator.show();
}

function removeAllChildrenFromContent()
{
    var children = $.content.children;
    for (var d = children.length - 1; d >= 0; d--) $.content.remove(children[d]);
}

function onStatisticsFetched(processedReportModel)
{
    removeAllChildrenFromContent();

    var accountModel = require('session').getAccount();

    $.index.title = processedReportModel.getReportName();
    
    showReportContent();

    if (!processedReportModel) {
        console.error('msising report model');
        return;
    }
    var columns = processedReportModel.get('columns');
    var reportData = processedReportModel.get('reportData');
    var sortColumn = processedReportModel.getSortOrder();

    $.reportGraphCtrl.update(processedReportModel, accountModel);

    var containerRow = null;
    var index = 0; 
    for (var metric in columns) {

        var labelColor = (metric == sortColumn) ? '#cb2026' : 'black';

        if (0 == (index % 2)) {
            containerRow = Ti.UI.createView({height: Ti.UI.SIZE, width: Ti.UI.FILL, layout: 'horizontal'});
            $.content.add(containerRow);
        } 
        var outerContainer = Ti.UI.createView({height: Ti.UI.SIZE, width: '50%'});
        var metricContainer = Ti.UI.createView({height: Ti.UI.SIZE, width: Ti.UI.FILL, top: 22, bottom: 25, layout: 'vertical'});
        var value = Ti.UI.createLabel({text: (reportData[metric] || '-'), textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER, top: 0, font: {fontSize: 25, fontWeight: 'bold'}, color: labelColor, left: 10, right: 10, height: Ti.UI.SIZE});
        var label = Ti.UI.createLabel({text: columns[metric].toUpperCase(), textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER, font: {fontSize: 13, fontWeight: 'bold'}, height: Ti.UI.SIZE, top: 5, color: '#7e7e7e', left: 10, right: 10});
        metricContainer.add(value);
        metricContainer.add(label);

        metricContainer.addEventListener('click', (function (metric) {
            var changeMetric = function () {
                currentMetric = metric;
                doRefresh();
            };

            return changeMetric;
        })(metric));

        outerContainer.add(metricContainer);
        containerRow.add(outerContainer);

        if (1 == (index % 2)) {
            var horizontalSeparator = Ti.UI.createView({height: 1, backgroundColor: '#e6e6e6', width: Ti.UI.FILL});
            $.content.add(horizontalSeparator);
/*
            var verticalSeparator = Ti.UI.createView({left: 0, zIndex: 2, width: 1, backgroundColor: '#e6e6e6', height: outerContainer.size.height});
            outerContainer.add(verticalSeparator);

            */
        }

        index++;


    }
    
    var verticalSeparator = Ti.UI.createView({left: '50%', zIndex: 2, width: 1, top: 17, bottom: 10, backgroundColor: '#e6e6e6', height: Ti.UI.FILL});
    $.outerContent.add(verticalSeparator);

}

function doRefresh()
{
    showLoadingMessage();

    var accountModel = require('session').getAccount();
    var siteModel    = require('session').getWebsite();

    var module = reportModel.get('module');
    var action = reportModel.get('action');
    var metric = reportModel.getSortOrder(currentMetric);

    statisticsModel.setSortOrder(metric);
    
    statisticsModel.fetch({
        account: accountModel,
        params: {period: reportDate.getPeriodQueryString(), 
                 date: reportDate.getDateQueryString(), 
                 idSite: siteModel.id, 
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

exports.open = function () {

    onReportChosen(reportModel);

    require('layout').open($.index);
};

exports.refresh = doRefresh;