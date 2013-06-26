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

// the currently selected report
var reportAction   = args.apiAction || '';
var reportModule   = args.apiModule || '';
var subtableId     = args.subtableId || '';
var currentMetric  = args.metric;
var reportDate     = require('session').getReportDate();

updateWindowTitle(args.reportTitle);
$.index.backButtonTitle = args.backButtonTitle || '';

$.initLoadingMessage();

function trackWindowRequest()
{
    var uniqueId = reportModule + '_' + reportAction;
    
    var tracker = require('Piwik/Tracker'); 
    tracker.setCustomVariable(1, 'reportModule', reportModule, 'page');
    tracker.setCustomVariable(2, 'reportAction', reportAction, 'page');
    tracker.setCustomVariable(3, 'reportUniqueId', uniqueId, 'page');
    tracker.setCustomVariable(4, 'reportMetric', currentMetric, 'page');

    tracker.trackWindow('Report Subtable', 'report/subtable');
}

function onOpen()
{
    trackWindowRequest();
}

function onClose()
{
    $.destroy();
    $.off();
}

function onMetricChosen(chosenMetric)
{
    require('Piwik/Tracker').trackEvent({title: 'Metric Changed', url: '/report/subtable/change/metric/' + chosenMetric});

    currentMetric = chosenMetric;
    $.doRefresh();
}

function toggleReportConfiguratorVisibility (event)
{
    require('report/configurator').toggleVisibility();

    require('Piwik/Tracker').trackEvent({title: 'Toggle Report Configurator', url: '/report/composite/toggle/report-configurator'});
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
        console.log('account or site not found, cannot refresh report subtable');
        return;
    }

    $.showLoadingMessage();

    // TODO fallback to day/today is not a good solution cause user won't notice we've fallen back to a different date
    var piwikPeriod = reportDate ? reportDate.getPeriodQueryString() : 'day';
    var piwikDate   = reportDate ? reportDate.getDateQueryString() : 'today';

    $.piwikProcessedReport.fetchProcessedReports(currentMetric, {
        account: accountModel,
        params: {period: piwikPeriod, 
                 date: piwikDate, 
                 idSite: siteModel.id, 
                 idSubtable: subtableId,
                 filter_limit: $.showAllEntries ? -1 : $.rowsFilterLimit,
                 apiModule: reportModule, 
                 apiAction: reportAction},
        success: $.renderProcessedReport,
        error: function (undefined, error) {
            if (error) {
                $.showReportHasNoData(error.getError(), error.getMessage());
            }
        }
    });
};

function open () {
    $.doRefresh();
    require('layout').open($.index);
}

function close () {
    require('layout').close($.index);
}

exports.open = open;
exports.close = close;