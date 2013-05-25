/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

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

function trackWindowRequest()
{
    var module   = reportModel.get('module');
    var action   = reportModel.get('action');
    var uniqueId = reportModel.get('uniqueId');

    require('Piwik/Tracker').setCustomVariable(1, 'reportModule', module, 'page');
    require('Piwik/Tracker').setCustomVariable(2, 'reportAction', action, 'page');
    require('Piwik/Tracker').setCustomVariable(3, 'reportUniqueId', uniqueId, 'page');

    require('Piwik/Tracker').trackWindow('Report Without Dimension', 'report/without-dimension');
}

function onOpen()
{
    trackWindowRequest();
}

function onClose()
{
    unregisterEvents();

    $.destroy();
    $.off();
}

function onWebsiteChanged()
{
    require('Piwik/Tracker').trackEvent({title: 'Website Changed', url: '/report/without-dimension/change/website'});

    doRefresh();
}

function onDateChanged(changedReportDate) 
{
    require('Piwik/Tracker').trackEvent({title: 'Date Changed', url: '/report/without-dimension/change/date'});

    reportDate = changedReportDate;
    doRefresh();
}

function onMetricChosen(chosenMetric)
{
    require('Piwik/Tracker').trackEvent({title: 'Metric Changed', url: '/report/without-dimension/change/metric/' + chosenMetric});

    currentMetric = chosenMetric;
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

function toggleReportChooserVisibility(event)
{
    require('report/chooser').toggleVisibility();

    require('Piwik/Tracker').trackEvent({title: 'Toggle Report Chooser', url: '/report/without-dimension/toggle/report-chooser'});
}

function toggleReportConfiguratorVisibility (event)
{
    require('report/configurator').toggleVisibility();

    require('Piwik/Tracker').trackEvent({title: 'Toggle Report Configurator', url: '/report/without-dimension/toggle/report-configurator'});
}

function removeAllChildrenFromContent()
{
    var children = $.content.children;
    for (var d = children.length - 1; d >= 0; d--) $.content.remove(children[d]);
}

function updateWindowTitle(title)
{
    if (OS_ANDROID) {
        $.headerBar.setTitle(title || '');
    } else {
        $.index.title = title || '';
    }
}

function toUnit(size)
{
    return OS_ANDROID ? (size + 'dp') : size;
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
        var outerContainer = Ti.UI.createView({height: Ti.UI.SIZE, width: OS_ANDROID ? '49%' : '50%'});
        var metricContainer = Ti.UI.createView({height: Ti.UI.SIZE, width: Ti.UI.FILL, top: toUnit(22), bottom: toUnit(25), layout: 'vertical'});
        var value = Ti.UI.createLabel({text: value, textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER, top: 0, font: {fontSize: toUnit(25), fontWeight: 'bold'}, color: labelColor, left: toUnit(10), right: toUnit(10), height: Ti.UI.SIZE});
        var label = Ti.UI.createLabel({text: (title + '').toUpperCase(), textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER, font: {fontSize: toUnit(13), fontWeight: 'bold'}, height: Ti.UI.SIZE, top: toUnit(5), color: '#7e7e7e', left: toUnit(10), right: toUnit(10)});
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
            var horizontalSeparator = Ti.UI.createView({height: toUnit(1), backgroundColor: '#e6e6e6', width: Ti.UI.FILL});
            $.content.add(horizontalSeparator);
        }
    }

function onStatisticsFetched(processedReportCollection)
{
    removeAllChildrenFromContent();

    var accountModel = require('session').getAccount();

    updateWindowTitle(processedReportCollection.getReportName());
    
    showReportContent();

    if (!processedReportCollection) {
        console.error('msising report model');
        return;
    }

    $.reportGraphCtrl.update(processedReportCollection, accountModel);

    processedReportCollection.forEach(renderMetricTile);
}

function fixVerticalSeparatorHeight()
{
    console.log('attention: this may cause an endless loop because of postlayout event. hopefully you do not see this too often');

    if (!$.content || !$.content.size || !$.content.size.height) { 

        return;
    }

    var height = parseInt($.content.size.height, 10);

    if (5 < height) {

        if (OS_MOBILEWEB) {
            // don't know why but on MobileWeb height will be only changed if there is a small delay. Tried lots of different implementations but didn't find a better solution
            setTimeout(function () {
                $.verticalSeparator.setHeight($.content.size.height);
            }, 100);
        } else {
            $.verticalSeparator.setHeight($.content.size.height);
        }
    } 
}

function doRefresh()
{
    showLoadingMessage();

    var accountModel = require('session').getAccount();
    var siteModel    = require('session').getWebsite();

    if (!accountModel || !siteModel) {
        console.log('account or site not found, cannot refresh report without dimension');
        return;
    }

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

function open() 
{
    $.content.addEventListener('postlayout', fixVerticalSeparatorHeight);

    onReportChosen(reportModel);

    require('layout').open($.index);
}

function close() 
{
    require('layout').close($.index);
}

exports.open  = open;
exports.close = close;