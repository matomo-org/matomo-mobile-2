function L(key)
{
    return require('L')(key);
}

var args         = arguments[0] || {};
var flatten      = args.flatten || 0;
var reportDate   = require('session').getReportDate();
var $model       = args ? args["$model"] : null;
$.metric.text    = $model.getMetricName();

function openReport()
{
    if (!hasReportRowsToDisplay()) {
        return;
    }
    
    var report = Alloy.createController('report_with_dimension', {report: $model});
    report.open();
}

function hideReportHasNoData()
{
    $.noData.hide();
    $.noData.height = 0;
}

function showReportHasNoData()
{
    $.noData.height = Ti.UI.SIZE;
    $.noData.show();
}

function hideMoreLink()
{
    $.footer.hide();
    $.footer.height = 0;
}

function hasReportRowsToDisplay()
{
    return ($.piwikProcessedReport && $.piwikProcessedReport.length);
}

function showReportContent()
{
    if (!hasReportRowsToDisplay()) {
        showReportHasNoData();
        hideMoreLink();
    }

    $.loadingIndicator.hide();
}

function showLoadingMessage()
{
    hideReportHasNoData();
    $.loadingIndicator.show();
}

function fetchProcessedReport()
{
    var accountModel = require('session').getAccount();
    var siteModel    = require('session').getWebsite();

    var module = $model.get('module');
    var action = $model.get('action');
    var metric = $model.getSortOrder();

    showLoadingMessage();
    $.piwikProcessedReport.on('reset', showReportContent);

    $.piwikProcessedReport.fetchProcessedReports(metric, {
        account: accountModel,
        params: {
            period: reportDate.getPeriodQueryString(), 
            date: reportDate.getDateQueryString(), 
            idSite: siteModel.id, 
            flat: flatten,
            filter_truncate: 3,
            apiModule: module, 
            apiAction: action
        }
    });
}

fetchProcessedReport();