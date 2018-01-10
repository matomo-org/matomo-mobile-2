/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var processedReport = null;

function doSelectMetric()
{
    if (!processedReport) {
        return;
    }
    
    var params         = {metrics: processedReport.getMetrics()};
    var metricsChooser = Alloy.createController('report_metrics_chooser', params);
    metricsChooser.on('metricChosen', onMetricChosen);
    metricsChooser.open();
}

function onMetricChosen(chosenMetric)
{
    $.trigger('metricChosen', chosenMetric);
}

exports.update = function (processedReportCollection) {

    if (!processedReportCollection) {
        return;
    }

    processedReport        = processedReportCollection;
    var selectedMetricName = processedReport.getMetricName();
    
    $.name.text = selectedMetricName;
};