/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function L(key)
{
    return require('L')(key);
}

var args         = arguments[0] || {};
var flatten      = args.flatten || 0;
var reportDate   = require('session').getReportDate();
var $model       = args["$model"];

$.metric.text    = $model.getMetricName();

var isFetched  = false;
var isRendered = false;

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

    $.loadingIndicator.height = 0;
    $.loadingIndicator.hide();
    $.content.height = Ti.UI.SIZE;
    $.content.show();
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

    if (!accountModel || !siteModel) {
        console.log('account or site not found, cannot refresh report overview with dimension');
        return;
    }

    var module = $model.getModule();
    var action = $model.getAction();
    var metric = $model.getSortOrder();

    showLoadingMessage();

    // TODO fallback to day/today is not a good solution cause user won't notice we've fallen back to a different date
    var piwikPeriod = reportDate ? reportDate.getPeriodQueryString() : 'day';
    var piwikDate   = reportDate ? reportDate.getDateQueryString() : 'today';

    $.piwikProcessedReport.fetchProcessedReports(metric, {
        account: accountModel,
        params: {
            period: piwikPeriod, 
            date: piwikDate, 
            idSite: siteModel.id, 
            flat: flatten,
            filter_truncate: 3,
            apiModule: module, 
            apiAction: action,
            showColumns: metric,
            hideMetricsDoc: 1
        },
        success: function () {
            isFetched = true;
            renderStatisticsIfViewIsInViewport();
        }
    });
}



var lastParentYPosition = null;
var lastMyYPosition     = null;

$model.on('scrollPosition', updateParentYPositionAndTryToRender);

function updateParentYPositionAndTryToRender(event) {
    if (!event) {
        return;
    }
    
    lastParentYPosition = event.y;
    renderStatisticsIfViewIsInViewport();
}

function setMyYPositionAndTryToRender()
{
    lastMyYPosition = $.index.rect ? $.index.rect.y : null;
    renderStatisticsIfViewIsInViewport();
}

function isMyViewLayouted()
{
    return !_.isNull(lastMyYPosition);
}

// actually, we should use the parentScrollview.height but platformHeight is a bit higher and 
// that makes sure the view will be rendered a view pixels before the user sees the box 
// when user scrolls to this view, it'll be already rendered depending on performance of device
var platformHeight = Ti.Platform.displayCaps.platformHeight;

function isViewInViewport()
{
    if (!isMyViewLayouted()) {
        return false;
    }

    var scrollYPosition = platformHeight;

    if (lastParentYPosition) {
        scrollYPosition += lastParentYPosition;
    }

    return (lastMyYPosition < scrollYPosition);
}

function renderStatisticsIfViewIsInViewport()
{
    if (!isRendered && isFetched && isViewInViewport()) {
        isRendered = true;
        renderStatisticsAndClose();
    }
}

function renderStatisticsAndClose()
{
    renderStatistics();
    showReportContent();
    onClose();
}

function onClose()
{
    $.index.removeEventListener('postlayout', setMyYPositionAndTryToRender);
    $model.off('scrollPosition', updateParentYPositionAndTryToRender);

    $.destroy();
    $.off();
}

$.piwikProcessedReport.off("fetch destroy change add remove reset", renderStatistics);
fetchProcessedReport();