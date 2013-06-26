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
var reportModel     = args.report;
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
    var module   = reportModel.getModule();
    var action   = reportModel.getAction();
    var uniqueId = reportModel.getUniqueId();

    var tracker  = require('Piwik/Tracker');
    tracker.setCustomVariable(1, 'reportModule', module, 'page');
    tracker.setCustomVariable(2, 'reportAction', action, 'page');
    tracker.setCustomVariable(3, 'reportUniqueId', uniqueId, 'page');

    tracker.trackWindow('Report With Dimension', 'report/with-dimension');
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
    require('Piwik/Tracker').trackEvent({title: 'Website Changed', url: '/report/with-dimension/change/website'});

    $.doRefresh();
}

function onDateChanged(changedReportDate) 
{
    if (!changedReportDate) {
        return;
    }
    
    require('Piwik/Tracker').trackEvent({title: 'Date Changed', url: '/report/with-dimension/change/date'});

    reportDate = changedReportDate;
    $.doRefresh();
}

function onMetricChosen(chosenMetric)
{
    if (!chosenMetric) {
        return;
    }

    require('Piwik/Tracker').trackEvent({title: 'Metric Changed', url: '/report/with-dimension/change/metric/' + chosenMetric});

    currentMetric = chosenMetric;
    $.doRefresh();
}

function toggleReportConfiguratorVisibility ()
{
    require('report/configurator').toggleVisibility();

    require('Piwik/Tracker').trackEvent({title: 'Toggle Report Configurator', url: '/report/with-dimension/toggle/report-configurator'});
}

function toggleReportChooserVisibility()
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
    var accountModel = require('session').getAccount();
    var siteModel    = require('session').getWebsite();

    if (!siteModel || !accountModel) {
        console.log('account or site not found, cannot refresh report with dimension');
        return;
    }

    $.showLoadingMessage();

    var module = reportModel.getModule();
    var action = reportModel.getAction();
    var metric = reportModel.getSortOrder(currentMetric);

    // TODO fallback to day/today is not a good solution cause user won't notice we've fallen back to a different date
    var piwikPeriod = reportDate ? reportDate.getPeriodQueryString() : 'day';
    var piwikDate   = reportDate ? reportDate.getDateQueryString() : 'today';

    $.piwikProcessedReport.fetchProcessedReports(metric, {
        account: accountModel,
        params: {period: piwikPeriod, 
                 date: piwikDate, 
                 idSite: siteModel.id, 
                 filter_limit: $.showAllEntries ? -1 : $.rowsFilterLimit,
                 apiModule: module, 
                 apiAction: action},
        success: $.renderProcessedReport,
        error: function (undefined, error) {
            if (error) {
                $.showReportHasNoData(error.getError(), error.getMessage());
            }
        }
    });
};

function open () {

    registerEvents();

    $.doRefresh();

    require('layout').open($.index);
}

function close () {
    require('layout').close($.index);
}

exports.open = open;
exports.close = close;