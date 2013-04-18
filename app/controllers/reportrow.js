var processedReport = arguments[0] || {};

if (processedReport) {
    $.title.text = processedReport.get('title');
    $.value.text = processedReport.get('value');
} 