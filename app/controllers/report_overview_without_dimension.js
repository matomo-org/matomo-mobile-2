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

var args         = arguments[0] || {};
var flatten      = args.flatten || 0;
var reportDate   = require('session').getReportDate();
var $model       = args["$model"];

$.metric.text = String.format('%s (%s)', '' + $model.getReportName(), '' + $model.getMetricName());

function openReport()
{
    var report = Alloy.createController('report_without_dimension', {report: $model});
    report.open();
}

function renderGraph()
{
    var accountModel = require('session').getAccount();
    if ($.piwikProcessedReport.first()) {
        $.graphCtrl.update($.piwikProcessedReport, accountModel);
        $.metric_value.text = $.piwikProcessedReport.first().getValue();
    } else {
        // TODO ... this.hide(); this.destroy()??
    }
}

function fetchProcessedReport()
{
    var accountModel = require('session').getAccount();
    var siteModel    = require('session').getWebsite();

    if (!accountModel || !siteModel) {
        console.log('account or site not found, cannot refresh report overview without dimension');
        return;
    }

    var module = $model.getModule();
    var action = $model.getAction();
    var metric = $model.getSortOrder();

    // TODO fallback to day/today is not a good solution cause user won't notice we've fallen back to a different date
    var piwikPeriod = reportDate ? reportDate.getPeriodQueryString() : 'day';
    var piwikDate   = reportDate ? reportDate.getDateQueryString() : 'today';

    $.piwikProcessedReport.fetchProcessedReports(metric, {
        account: accountModel,
        params: {
            period: piwikPeriod, 
            date: piwikDate, 
            idSite: siteModel.id, 
            flat: flatten,
            filter_limit: 1,
            apiModule: module, 
            apiAction: action
        }
    });
}

$.piwikProcessedReport.on('reset', renderGraph);
fetchProcessedReport();