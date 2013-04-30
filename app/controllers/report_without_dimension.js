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
var processedReportCollection = Alloy.createCollection('piwikProcessedReport');

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

var containerRow = null;
function renderMetricTile (processedReportModel, index) {

        var title = processedReportModel.getTitle();
        var value = processedReportModel.getValue();
        var sortColumnModel  = processedReportModel.getSortOrder();
        var sortColumnReport = processedReportCollection.getSortOrder(); 

        var labelColor = (sortColumnReport == sortColumnModel) ? '#cb2026' : 'black';

        if (0 == (index % 2)) {
            containerRow = Ti.UI.createView({height: Ti.UI.SIZE, width: Ti.UI.FILL, layout: 'horizontal'});
            $.content.add(containerRow);
        } 
        var outerContainer = Ti.UI.createView({height: Ti.UI.SIZE, width: '50%'});
        var metricContainer = Ti.UI.createView({height: Ti.UI.SIZE, width: Ti.UI.FILL, top: 22, bottom: 25, layout: 'vertical'});
        var value = Ti.UI.createLabel({text: value, textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER, top: 0, font: {fontSize: 25, fontWeight: 'bold'}, color: labelColor, left: 10, right: 10, height: Ti.UI.SIZE});
        var label = Ti.UI.createLabel({text: (title + '').toUpperCase(), textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER, font: {fontSize: 13, fontWeight: 'bold'}, height: Ti.UI.SIZE, top: 5, color: '#7e7e7e', left: 10, right: 10});
        metricContainer.add(value);
        metricContainer.add(label);

        metricContainer.addEventListener('click', (function (metric) {
            var changeMetric = function () {
                currentMetric = metric;
                doRefresh();
            };

            return changeMetric;
        })(sortColumnModel));

        outerContainer.add(metricContainer);
        containerRow.add(outerContainer);

        if (1 == (index % 2)) {
            var horizontalSeparator = Ti.UI.createView({height: 1, backgroundColor: '#e6e6e6', width: Ti.UI.FILL});
            $.content.add(horizontalSeparator);
        }
    }

function onStatisticsFetched(processedReportCollection)
{
    removeAllChildrenFromContent();

    var accountModel = require('session').getAccount();

    $.index.title = processedReportCollection.getReportName();
    
    showReportContent();

    if (!processedReportCollection) {
        console.error('msising report model');
        return;
    }

    $.reportGraphCtrl.update(processedReportCollection, accountModel);

    processedReportCollection.forEach(renderMetricTile);

    var verticalSeparator = Ti.UI.createView({left: '50%', zIndex: 2, width: 1, top: 17, backgroundColor: '#e6e6e6', height: $.content.size.height});
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

    processedReportCollection.fetchProcessedReports(metric, {
        account: accountModel,
        params: {period: reportDate.getPeriodQueryString(), 
                 date: reportDate.getDateQueryString(), 
                 idSite: siteModel.id, 
                 apiModule: module, 
                 apiAction: action},
        error: function () {
            processedReportCollection.trigger('error', {type: 'loadingProcessedReport'});
        },
        success: onStatisticsFetched
    });
}

exports.open = function () {

    onReportChosen(reportModel);

    require('layout').open($.index);
};