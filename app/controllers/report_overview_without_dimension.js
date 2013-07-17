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
$.piwikProcessedReport = args.processedReport;

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
        $.graphCtrl.hide();
    }
}

function close()
{
    $.piwikProcessedReport.off();
    $.destroy();
    $.off();
}

exports.open = function () {
    // do not render this directly, because the image view width and so on will be wrong
    renderGraph();
    close();
};

exports.close = function () {

};