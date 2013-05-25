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

exports.baseController = "report_with_dimension_base";

var args = arguments[0] || {};

var currentMetric   = null;
// the currently selected report
var reportModel     = args.report || false;
var reportList      = args.reportList || {};
var reportDate      = require('session').getReportDate();

updateWindowTitle(reportModel.getReportName());

$.initLoadingMessage();

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

    require('Piwik/Tracker').trackWindow('Report With Dimension', 'report/with-dimension');
}

function onOpen()
{
    trackWindowRequest();
}

function onClose()
{
    unregisterEvents();

    $.destroy();
}

function onWebsiteChanged()
{
    require('Piwik/Tracker').trackEvent({title: 'Website Changed', url: '/report/with-dimension/change/website'});

    $.doRefresh();
}

function onDateChanged(changedReportDate) 
{
    require('Piwik/Tracker').trackEvent({title: 'Date Changed', url: '/report/with-dimension/change/date'});

    reportDate = changedReportDate;
    $.doRefresh();
}

function onMetricChosen(chosenMetric)
{
    require('Piwik/Tracker').trackEvent({title: 'Metric Changed', url: '/report/with-dimension/change/metric/' + chosenMetric});

    currentMetric = chosenMetric;
    $.doRefresh();
}

function toggleReportConfiguratorVisibility (event)
{
    require('report/configurator').toggleVisibility();

    require('Piwik/Tracker').trackEvent({title: 'Toggle Report Configurator', url: '/report/with-dimension/toggle/report-configurator'});
}

function toggleReportChooserVisibility(event)
{
    require('report/chooser').toggleVisibility();

    require('Piwik/Tracker').trackEvent({title: 'Toggle Report Chooser', url: '/report/with-dimension/toggle/report-chooser'});
}

function updateWindowTitle(title)
{
    if (OS_ANDROID) {
        $.headerBar.setTitle(title || '');
    } else {
        $.index.title = title || '';
    }
}

exports.doRefresh = function()
{
    $.showLoadingMessage();

    var accountModel = require('session').getAccount();
    var siteModel    = require('session').getWebsite();

    if (!siteModel || !accountModel) {
        console.log('account or site not found, cannot refresh report with dimension');
        return;
    }

    var module = reportModel.get('module');
    var action = reportModel.get('action');
    var metric = reportModel.getSortOrder(currentMetric);

    $.piwikProcessedReport.fetchProcessedReports(metric, {
        account: accountModel,
        params: {period: reportDate.getPeriodQueryString(), 
                 date: reportDate.getDateQueryString(), 
                 idSite: siteModel.id, 
                 filter_limit: $.showAllEntries ? -1 : $.rowsFilterLimit,
                 apiModule: module, 
                 apiAction: action},
        success: $.renderProcessedReport
    });
};

function open () {

    registerEvents();

    $.doRefresh();

    require('layout').open($.index);
};

function close () {
    require('layout').close($.index);
};

exports.open = open;
exports.close = close;