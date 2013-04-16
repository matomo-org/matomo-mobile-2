function L(key)
{
    return require('L')(key);
}

var args         = arguments[0] || {};
var flatten      = args.flatten || 0;
var reportPeriod = args.period || 'day';
var reportDate   = args.date || 'today';
var $model       = args ? args["$model"] : null;
$.metric.text    = $model.getMetricName();

function openReport()
{
    var report = Alloy.createController('report_with_dimension', {report: $model});
    report.open();
}

function fetchProcessedReport()
{
    var accountModel = require('session').getAccount();
    var siteModel    = require('session').getWebsite();

    var module = $model.get('module');
    var action = $model.get('action');
    var metric = $model.getSortOrder();

    $.piwikProcessedReport.fetchProcessedReports(metric, {
        account: accountModel,
        params: {
            period: reportPeriod, 
            date: reportDate, 
            idSite: siteModel.id, 
            flat: flatten,
            filter_truncate: 3,
            apiModule: module, 
            apiAction: action
        }
    });
}

fetchProcessedReport();