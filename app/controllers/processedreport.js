
var args = arguments[0] || {};
var report = args.processedReport || {};
var account = args.account || {};

$.reportInfoName.text = report.get('metadata').dimension + ' - ' + report.get('metadata').name;
$.reportInfoDate.text = report.get('prettyDate');
$.reportGraphImageView.image = account.getBasePath() + report.get('metadata').imageGraphUrl;