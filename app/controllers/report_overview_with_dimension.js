/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};
$.piwikProcessedReport.add(args.processedReport.models);

$.metric.text = $model.getMetricName();

function openReport()
{
    var report = Alloy.createController('report_with_dimension', {report: $model});
    report.open();
}

function hideReportHasNoData()
{
    $.noData.hide();
    $.noData.height = 0;
}

function showReportHasNoData(message)
{
    $.noDataDescription.text = '' + message;

    $.noData.height = Ti.UI.SIZE;
    $.noData.show();
}

function hideMoreLink()
{
    $.footer.hide();
    $.footer.height = 0;
}

function hasReportRowsToDisplay()
{
    return ($.piwikProcessedReport && $.piwikProcessedReport.length);
}

function showReportContent()
{
    hideReportHasNoData();
    $.content.height = Ti.UI.SIZE;
    $.content.show();
}

function close()
{
    $.destroy();
    $.off();
}

function render()
{
    if (!hasReportRowsToDisplay()) {
        showReportHasNoData(L('CoreHome_TableNoData'));
        hideMoreLink();
    } else {
        renderStatistics();
        showReportContent();
    }
}

render();
close();

exports.open = function ()
{
};

exports.close = function ()
{
    if (OS_ANDROID && $.content) {
        // prevent leaking tableViewRows
        $.content.setData([]);
    }
};