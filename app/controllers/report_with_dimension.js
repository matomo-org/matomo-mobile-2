
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
var reportDate      = require('session').getReportDate();

updateWindowTitle(reportModel.getReportName());

$.initLoadingMessage();

function registerEvents()
{
    var session = require('session');
    session.on('websiteChanged', onWebsiteChanged);
    session.on('reportDateChanged', onDateChanged);
    session.on('segmentChanged', onSegmentChanged);
}

function unregisterEvents()
{
    var session = require('session');
    session.off('websiteChanged', onWebsiteChanged);
    session.off('reportDateChanged', onDateChanged);
    session.off('segmentChanged', onSegmentChanged);
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
    $.emptyData && $.emptyData.cleanupIfNeeded();
    $.emptyData = null;

    if (OS_ANDROID) {
        // this frees a lot of memory
        $.reportTable.setData([]);
    }

    $.destroy();
    $.off();
}

function onWebsiteChanged()
{
    require('Piwik/Tracker').trackEvent({name: 'Website Changed', action: 'result', category: 'Report With Dimension'});

    $.doRefresh();
}

function onSegmentChanged()
{
    require('Piwik/Tracker').trackEvent({name: 'Segment Changed', action: 'result', category: 'Report With Dimension'});

    $.doRefresh();
}

function onDateChanged(changedReportDate) 
{
    if (!changedReportDate) {
        return;
    }
    
    require('Piwik/Tracker').trackEvent({name: 'Date Changed', action: 'result', category: 'Report With Dimension'});

    reportDate = changedReportDate;
    $.doRefresh();
}

function onMetricChosen(chosenMetric)
{
    if (!chosenMetric) {
        return;
    }

    require('Piwik/Tracker').setCustomVariable(1, 'metric', chosenMetric, 'event');
    require('Piwik/Tracker').trackEvent({name: 'Metric Changed', action: 'result', category: 'Report With Dimension'});

    currentMetric = chosenMetric;
    $.doRefresh();
}

function toggleReportConfiguratorVisibility ()
{
    require('report/configurator').toggleVisibility();

    require('Piwik/Tracker').trackEvent({name: 'Toggle Report Configurator', category: 'Report With Dimension'});
}

function toggleReportChooserVisibility()
{
    require('report/chooser').toggleVisibility();

    require('Piwik/Tracker').trackEvent({name: 'Toggle Report Chooser', category: 'Report With Dimension'});
}

function updateWindowTitle(title)
{
    if (OS_ANDROID) {
        $.headerBar.setTitle(title || '');
    } else {
        $.index.title = title || '';
    }
}

function doRefresh()
{
    var accountModel = require('session').getAccount();
    var siteModel    = require('session').getWebsite();
    var segmentModel = require('session').getSegment();

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

    var params = {period: piwikPeriod,
                  date: piwikDate,
                  idSite: siteModel.id,
                  filter_limit: $.showAllEntries ? -1 : $.rowsFilterLimit,
                  apiModule: module,
                  apiAction: action};

    if (reportModel.hasParameters()) {
        _.extend(params, reportModel.getParameters());
    }

    $.piwikProcessedReport.fetchProcessedReports(metric, {
        account: accountModel,
        segment: segmentModel,
        params: params,
        success: $.renderProcessedReport,
        error: function (undefined, error) {
            if (error) {
                $.showReportHasNoData(error.getError(), error.getMessage());
            }
        }
    });
};

exports.doRefresh = doRefresh;

function open ()
{
    registerEvents();

    require('layout').open($.index);

    $.doRefresh();
}

function close () {
    require('layout').close($.index);
}

exports.open = open;
exports.close = close;