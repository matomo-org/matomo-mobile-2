function L(key)
{
    return require('L')(key);
}

var args         = arguments[0] || {};
var flatten      = args.flatten || 0;
var reportList   = args.reportList || {};
var reportPeriod = args.period || 'day';
var reportDate   = args.date || 'today';

var module = $model.get('module');
var action = $model.get('action');
var metric = $model.getSortOrder();
var accountModel = $model.accountModel;
var siteModel    = $model.siteModel;

var processedReport = $.piwikProcessedReport;

function openReport()
{
    var params = {account: accountModel, site: siteModel, report: $model};
    var report = Alloy.createController('report', params);
    report.open();
}

// TODO currently fetch and reset are triggered... causes list is rendered twice!
processedReport.off("reset");

processedReport.fetchProcessedReports(metric, {
    account: accountModel,
    params: {
        period: reportPeriod, 
        date: reportDate, 
        idSite: siteModel.id, 
        flat: flatten,
        filter_limit: 4,
        apiModule: module, 
        apiAction: action
    }
});