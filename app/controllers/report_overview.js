/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var params = arguments[0];

var isFetched    = false;
var isClosed     = false;
var isRendered   = false;
var hasDimension = $model.hasDimension();
var renderedReport = null;

$.loading.text = String.format(L('Mobile_LoadingReport'), '' + $model.getReportName());

if (!hasDimension) {
    $.index.height = OS_ANDROID ? '281dp' : 265;
}

$model.on('scrollPosition', updateParentYPositionAndTryToRender);
$model.on('windowClose', unregisterEvents);
$model.on('windowClose', close);

fetchProcessedReport();

function L(key)
{
    return require('L')(key);
}

function close()
{
    if (isClosed) {
        return;
    }

    isClosed = true;

    if (renderedReport) {
        renderedReport.close();
        renderedReport = null;
    }

    $model.off('windowClose', close);
}

function unregisterEvents()
{
    $.piwikProcessedReport.abortRunningRequests();

    $.index.removeEventListener('postlayout', renderStatisticsIfViewIsInViewport);
    $.piwikProcessedReport.off();

    $.destroy();
    $.off();

    $model.off('windowClose', unregisterEvents);
    $model.off('scrollPosition', updateParentYPositionAndTryToRender);
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
                  hideMetricsDoc: 1,
                  showColumns: getMetric()};

    if ($model.hasParameters()) {
        _.extend(params, $model.getParameters());
    }

    if (hasDimension) {
        params.filter_truncate = 3;
    } else {
        params.filter_limit = 1;
    }

    return params;
}

function fetchProcessedReport()
{
    var accountModel = require('session').getAccount();
    var siteModel    = require('session').getWebsite();
    var segmentModel = require('session').getSegment();

    if (!accountModel || !siteModel) {
        console.log('account or site not found, cannot refresh report overview with dimension');
        return;
    }

    $.piwikProcessedReport.fetchProcessedReports(getMetric(), {
        account: accountModel,
        segment: segmentModel,
        params: getRequestParams(),
        success: function () {
            isFetched = true;
            renderStatisticsIfViewIsInViewport();
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
    $.loading.text   = String.format('%s (%s)', message + '', $model.getReportName() + '');
    $.loading.top    = OS_ANDROID ? '16dp' : 10;
    $.loading.bottom = OS_ANDROID ? '16dp' : 10;
    $.loading.height = Ti.UI.SIZE;
    sizeBoxToContent();
    close();
}


var lastParentYScrollPosition = null;
function updateParentYPositionAndTryToRender(event) {
    if (!event || isClosed) {
        return;
    }

    if (_.has(event, 'y')) {
        lastParentYScrollPosition = event.y;
    }

    renderStatisticsIfViewIsInViewport();
}

function getMyYPosition()
{
    return $.index.rect ? $.index.rect.y : null;
}

var isLayouted = false;
function isMyViewLayouted()
{
    if (isLayouted) {
        // code looks stupid but we want to cache this to prevent it from executing too often.
        return true;
    }

    isLayouted = !_.isNull(getMyYPosition());

    return isLayouted;
}

// actually, we should use the parentScrollview.height but platformHeight is a bit higher and
// that makes sure the view will be rendered a view pixels before the user sees the box
// when user scrolls to this view, it'll be already rendered depending on performance of device
var platformHeight = Ti.Platform.displayCaps.platformHeight + 100;

function isViewInViewport()
{
    if (!isMyViewLayouted()) {
        return false;
    }

    var scrollYPosition = platformHeight;

    if (lastParentYScrollPosition) {
        scrollYPosition += lastParentYScrollPosition;
    }

    return (getMyYPosition() < scrollYPosition);
}

function renderStatisticsIfViewIsInViewport()
{
    if (!isRendered && !isClosed && isFetched && isViewInViewport()) {
        // prevent from race conditions rendering twice
        isRendered = true;
        renderOverviewReport();
        unregisterEvents();
    }
}

function renderOverviewReport()
{
    if ($.loading) {
        $.index.remove($.loading);
        $.loading = null;
    }

    params.processedReport = $.piwikProcessedReport;
    params['$model'] = $model;

    var controller = $.piwikProcessedReport.hasDimension() ? 'report_overview_with_dimension' : 'report_overview_without_dimension';
    renderedReport = Alloy.createController(controller, params);

    sizeBoxToContent();
    renderedReport.setParent($.index);
    renderedReport.open();

    params = null;
}