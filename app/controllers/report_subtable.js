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

$.index.title           = args.reportTitle || '';
$.index.backButtonTitle = args.backButtonTitle;

$.initLoadingMessage();

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
    $.doRefresh();
}

exports.doRefresh = function()
{
    $.showLoadingMessage();

    var accountModel = require('session').getAccount();
    var siteModel    = require('session').getWebsite();

    $.piwikProcessedReport.fetchProcessedReports(currentMetric, {
        account: accountModel,
        params: {period: reportDate.getPeriodQueryString(), 
                 date: reportDate.getDateQueryString(), 
                 idSite: siteModel.id, 
                 idSubtable: subtableId,
                 filter_limit: $.showAllEntries ? -1 : $.rowsFilterLimit,
                 apiModule: reportModule, 
                 apiAction: reportAction},
        success: $.renderProcessedReport
    });
};

exports.open = function () {

    $.doRefresh();

    require('layout').open($.index);
};