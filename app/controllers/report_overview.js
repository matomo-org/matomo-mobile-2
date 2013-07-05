/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var params = arguments[0];

var isClosed     = false;
var hasDimension = $model.hasDimension();

$.loading.text = String.format(L('Mobile_LoadingReport'), '' + $model.getReportName());

if (!hasDimension) {
    $.index.height = 265;
}

$model.on('windowClose', close);

fetchProcessedReport();

function L(key)
{
    return require('L')(key);
}

function close()
{
    isClosed = true;
    $.piwikProcessedReport.abortRunningRequests();

    $model.off('windowClose', close);

    $.piwikProcessedReport.off();
    $.destroy();
    $.off();
}

function getMetric()
{
    return $model.getSortOrder();
}

function getRequestParams()
{
    var module = $model.getModule();
    var action = $model.getAction();

    // TODO fallback to day/today is not a good solution cause user won't notice we've fallen back to a different date
    var reportDate  = require('session').getReportDate();
    var piwikPeriod = reportDate ? reportDate.getPeriodQueryString() : 'day';
    var piwikDate   = reportDate ? reportDate.getDateQueryString() : 'today';

    var siteModel   = require('session').getWebsite();

    var params = {period: piwikPeriod,
                  date: piwikDate,
                  idSite: siteModel.id,
                  apiModule: module,
                  apiAction: action,
                  hideMetricsDoc: 1};

    if ($model.hasParameters()) {
        _.extend(params, $model.getParameters());
    }

    if (hasDimension) {
        params.filter_truncate = 3;
        params.showColumns     = getMetric();
    } else {
        params.filter_limit = 1;
    }

    return params;
}

function fetchProcessedReport()
{
    var accountModel = require('session').getAccount();
    var siteModel    = require('session').getWebsite();

    if (!accountModel || !siteModel) {
        console.log('account or site not found, cannot refresh report overview with dimension');
        return;
    }

    $.piwikProcessedReport.fetchProcessedReports(getMetric(), {
        account: accountModel,
        params: getRequestParams(),
        success: function () {
            renderOverviewReport();
        },
        error: function (undefined, error) {
            if (error && $.loading) {
                showErrorMessage(error.getError());
            }
        }
    });
}

function sizeBoxToContent()
{
    $.index.height = Ti.UI.SIZE;
}

function showErrorMessage(message)
{
    $.loading.text   = '' + message;
    $.loading.top    = OS_ANDROID ? '16dp' : 10;
    $.loading.bottom = OS_ANDROID ? '16dp' : 10;
    $.loading.height = Ti.UI.SIZE;
    sizeBoxToContent();
}

function renderOverviewReport()
{
    if (isClosed) {
        return;
    }

    if ($.loading) {
        $.index.remove($.loading);
        $.loading = null;
    }

    params.processedReport = $.piwikProcessedReport;

    var controller = hasDimension ? 'report_overview_with_dimension' : 'report_overview_without_dimension';
    var report     = Alloy.createController(controller, params);

    sizeBoxToContent();
    report.setParent($.index);
    report.open();

    params = null;
}