var processedReport = null;

function doSelectMetric()
{
    var params         = {metrics: processedReport.getMetrics()};
    var metricsChooser = Alloy.createController('reportmetricschooser', params);
    metricsChooser.on('metricChosen', onMetricChosen)
    metricsChooser.open();
}

function onMetricChosen(chosenMetric)
{
    $.trigger('metricChosen', chosenMetric);
}

exports.update = function (processedReportModel) {
    processedReport        = processedReportModel;
    var selectedMetricName = processedReport.getMetricName();
    
    $.name.text = selectedMetricName
}