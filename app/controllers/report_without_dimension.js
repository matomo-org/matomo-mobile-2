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

var emptyData     = new (require('ui/emptydata'));
var currentMetric = null;
var reportModel   = args.report;
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
    var module   = reportModel.getModule();
    var action   = reportModel.getAction();
    var uniqueId = reportModel.getUniqueId();

    var tracker  = require('Piwik/Tracker');
    tracker.setCustomVariable(1, 'reportModule', module, 'page');
    tracker.setCustomVariable(2, 'reportAction', action, 'page');
    tracker.setCustomVariable(3, 'reportUniqueId', uniqueId, 'page');

    require('Piwik/Tracker').trackWindow('Report Without Dimension', 'report/without-dimension');
}

function onOpen()
{
    trackWindowRequest();
}

function onClose()
{
    emptyData && emptyData.cleanupIfNeeded();
    emptyData = null;

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
    if (!changedReportDate) {
        return;
    }

    require('Piwik/Tracker').trackEvent({title: 'Date Changed', url: '/report/without-dimension/change/date'});

    reportDate = changedReportDate;
    doRefresh();
}

function onMetricChosen(chosenMetric)
{
    if (!chosenMetric) {
        return;
    }

    require('Piwik/Tracker').trackEvent({title: 'Metric Changed', url: '/report/without-dimension/change/metric/' + chosenMetric});

    currentMetric = chosenMetric;
    doRefresh();
}

function onReportChosen (chosenReportModel) {
    if (!chosenReportModel) {
        return;
    }

    reportModel   = chosenReportModel;
    currentMetric = null;

    doRefresh();
}

function showReportContent()
{
    $.content.show();
    $.loadingindicator.hide();
    emptyData.cleanupIfNeeded();
}

function showReportHasNoData(title, message)
{
    emptyData.show($.index, doRefresh, title, message);

    $.content.hide();
    $.loadingindicator.hide();
}

function showLoadingMessage()
{
    $.loadingindicator.show();
    $.content.hide();
    emptyData.cleanupIfNeeded();
}

function toggleReportChooserVisibility()
{
    require('report/chooser').toggleVisibility();

    require('Piwik/Tracker').trackEvent({title: 'Toggle Report Chooser', url: '/report/without-dimension/toggle/report-chooser'});
}

function toggleReportConfiguratorVisibility ()
{
    require('report/configurator').toggleVisibility();

    require('Piwik/Tracker').trackEvent({title: 'Toggle Report Configurator', url: '/report/without-dimension/toggle/report-configurator'});
}

function removeAllChildrenFromContent()
{
    var children = $.dimensions.children;

    if (!children) {
        return;
    }

    for (var d = children.length - 1; d >= 0; d--) $.dimensions.remove(children[d]);
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
function renderMetricTile (processedReportModel, index) 
{
    if (!processedReportModel) {
        return;
    }

    var title = processedReportModel.getTitle();
    var value = processedReportModel.getValue();
    var sortColumnModel  = processedReportModel.getSortOrder();
    var sortColumnReport = processedReportCollection.getSortOrder(); 

    var labelColor = (sortColumnReport == sortColumnModel) ? '#cb2026' : 'black';

    if (0 == (index % 2)) {
        containerRow = Ti.UI.createView({height: Ti.UI.SIZE, width: Ti.UI.FILL, layout: 'horizontal'});
        $.dimensions.add(containerRow);
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
        $.dimensions.add(horizontalSeparator);
    }
}

function onStatisticsFetched(processedReportCollection)
{
    if (!processedReportCollection) {
        console.error('msising report model');
        return;
    }

    removeAllChildrenFromContent();

    if ($.content.scrollTo) {
        $.content.scrollTo(0, 0);
    }

    if (!processedReportCollection.length) {
        showReportHasNoData(L('Mobile_NoDataShort'), L('CoreHome_ThereIsNoDataForThisReport'));
        return;
    }

    var accountModel = require('session').getAccount();

    updateWindowTitle(processedReportCollection.getReportName());
    
    showReportContent();

    $.reportGraphCtrl.update(processedReportCollection, accountModel);

    processedReportCollection.forEach(renderMetricTile);
}

function fixVerticalSeparatorHeight()
{
    console.log('attention: this may cause an endless loop because of postlayout event. hopefully you do not see this too often');

    if (!$.dimensions || !$.dimensions.size || !$.dimensions.size.height) {

        return;
    }

    var height = parseInt($.dimensions.size.height, 10);

    if (5 < height) {

        if (OS_MOBILEWEB) {
            // don't know why but on MobileWeb height will be only changed if there is a small delay. Tried lots of different implementations but didn't find a better solution
            setTimeout(function () {
                if (!$ || !$.verticalSeparator || !$.dimensions) {
                    return;
                }
                $.verticalSeparator.setHeight($.dimensions.size.height);
            }, 100);
        } else {
            $.verticalSeparator.setHeight($.dimensions.size.height);
        }
    } 
}

function doRefresh()
{
    var accountModel = require('session').getAccount();
    var siteModel    = require('session').getWebsite();

    if (!accountModel || !siteModel) {
        console.log('account or site not found, cannot refresh report without dimension');
        return;
    }

    showLoadingMessage();

    var module = reportModel.getModule();
    var action = reportModel.getAction();
    var metric = reportModel.getSortOrder(currentMetric);

    // TODO fallback to day/today is not a good solution cause user won't notice we've fallen back to a different date
    var piwikPeriod = reportDate ? reportDate.getPeriodQueryString() : 'day';
    var piwikDate   = reportDate ? reportDate.getDateQueryString() : 'today';

    processedReportCollection.fetchProcessedReports(metric, {
        account: accountModel,
        params: {period: piwikPeriod, 
                 date: piwikDate, 
                 idSite: siteModel.id, 
                 apiModule: module, 
                 apiAction: action},
        error: function (undefined, error) {
            if (error) {
                showReportHasNoData(error.getError(), error.getMessage());
            }
        },
        success: onStatisticsFetched
    });
}

function open() 
{
    $.dimensions.addEventListener('postlayout', fixVerticalSeparatorHeight);

    registerEvents();

    onReportChosen(reportModel);

    require('layout').open($.index);
}

function close() 
{
    require('layout').close($.index);
}

exports.open  = open;
exports.close = close;