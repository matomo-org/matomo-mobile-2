exports.update = function (processedReportModel) {
    var selectedMetricName = processedReportModel.getMetricName();
    var reportName         = processedReportModel.getReportName();
    
    $.name.text = selectedMetricName + ' - ' + reportName;
    $.date.text = processedReportModel.get('prettyDate');
}