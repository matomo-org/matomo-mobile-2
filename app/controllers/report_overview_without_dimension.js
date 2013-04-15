function L(key)
{
    return require('L')(key);
}

var args         = arguments[0] || {};
var flatten      = args.flatten || 0;
var reportPeriod = args.period || 'day';
var reportDate   = args.date || 'today';
var $model       = args ? args["$model"] : null;

$.headline.text = String.format('%s (%s)', '' + $model.getReportName(), '' + $model.getMetricName());

function openReport()
{
    var report = Alloy.createController('report_without_dimension', {report: $model});
    report.open();
}

function renderGraph()
{
    var accountModel = require('session').getAccount();
    if ($.piwikProcessedReport.first()) {
        $.graphCtrl.update($.piwikProcessedReport.first(), accountModel);
    } else {
        // TODO ... this.hide(); this.destroy()??
    }
}

function fetchProcessedReport()
{
    var accountModel = require('session').getAccount();
    var siteModel    = require('session').getWebsite();

    var module = $model.get('module');
    var action = $model.get('action');
    var metric = $model.getSortOrder();
// nur für die spalte für die wir den graphen anzeigen
    $.piwikProcessedReport.fetchProcessedReports(metric, {
        account: accountModel,
        params: {
            period: reportPeriod, 
            date: reportDate, 
            idSite: siteModel.id, 
            flat: flatten,
            filter_limit: 1,
            apiModule: module, 
            apiAction: action
        }
    });
}

$.piwikProcessedReport.on('reset', renderGraph)
fetchProcessedReport();