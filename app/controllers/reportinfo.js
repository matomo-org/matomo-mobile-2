exports.update = function (processedReportModel) {
    var selectedMetricName = processedReportModel.getMetricName();
    
    $.name.text = selectedMetricName
}