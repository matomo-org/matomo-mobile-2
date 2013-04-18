var processedReport = arguments[0] || {};

if (processedReport) {
    $.title.text = processedReport.getTitle();
    $.value.text = processedReport.getValue();
} 