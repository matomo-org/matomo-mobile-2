var args = arguments[0] || {};
var processedReportModel = args.report || false;

_.each(processedReportModel.getRows(), function (report) {
    var reportRow = Alloy.createController('reportrow', report);
    $.index.add(reportRow.getView());
});