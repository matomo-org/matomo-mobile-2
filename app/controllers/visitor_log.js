/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function L(key)
{
    return require('L')(key);
}

$.emptyData = new (require('ui/emptydata'));

var visitorLog = Alloy.createCollection('piwikLastVisitDetails');
visitorLog.on('reset', render);
visitorLog.on('error', onFetchError);

function registerEvents()
{
    var session = require('session');
    session.on('websiteChanged', onWebsiteChanged);
    session.on('reportDateChanged', onDateChanged);
    session.on('segmentChanged', onSegmentChanged);
}

function unregisterEvents()
{
    var session = require('session');
    session.off('websiteChanged', onWebsiteChanged);
    session.off('reportDateChanged', onSegmentChanged);
    session.off('segmentChanged', onSegmentChanged);
}

function openVisitor(event)
{
    if (!event || !event.row || !event.row.visitor) {
        return;
    }

    var params  = {visitor: event.row.visitor};
    var visitor = Alloy.createController('visitor', params);
    visitor.open();
}

function onWebsiteChanged()
{
    require('Piwik/Tracker').trackEvent({name: 'Website Changed', action: 'result', category: 'Visitor Log'});

    doRefresh();
}

function onSegmentChanged()
{
    require('Piwik/Tracker').trackEvent({name: 'Segment Changed', action: 'result', category: 'Visitor Log'});

    doRefresh();
}

function onDateChanged(date)
{
    if (!date) {
        return;
    }

    require('Piwik/Tracker').trackEvent({name: 'Date Changed', action: 'result', category: 'Visitor Log'});

    doRefresh();
}

function trackWindowRequest()
{
    require('Piwik/Tracker').trackWindow('Visitor Log', 'visitor-log');
}

function onOpen()
{
    trackWindowRequest();
}

function onClose()
{
    if ($.emptyData) {
        $.emptyData && $.emptyData.cleanupIfNeeded();
        $.emptyData = null;
    }

        // this frees a lot of memory
        $.visitorLogTable.setData([]);

    unregisterEvents();
    $.destroy();
    $.off();
}

function fetchPrevious()
{
    var accountModel = require('session').getAccount();
    var siteModel    = require('session').getWebsite();
    var segmentModel = require('session').getSegment();

    if (!accountModel || !siteModel) {
        console.log('account or site not found, cannot fetch previous visitors');
        return;
    }

    showLoadingMessage();
    visitorLog.previous(accountModel, segmentModel, siteModel.id);

    require('Piwik/Tracker').trackEvent({name: 'Previous Visitors', category: 'Visitor Log'});
}

function fetchNext()
{
    var accountModel = require('session').getAccount();
    var siteModel    = require('session').getWebsite();
    var segmentModel = require('session').getSegment();

    if (!accountModel || !siteModel) {
        console.log('account or site not found, cannot fetch next visitors');
        return;
    }

    showLoadingMessage();
    visitorLog.next(accountModel, segmentModel, siteModel.id);

    require('Piwik/Tracker').trackEvent({name: 'Next Visitors', category: 'Visitor Log'});
}

function scrollToTop()
{
    $.visitorLogTable.setData([]);
    
    if (OS_MOBILEWEB) {
        $.visitorLogTable.scrollToTop(0);
    }
}

function getNextRowParams()
{
    var nextRow = {title: L('General_Next'), color: '#3450A3', className: 'visitorlogPaginator'};
    if (OS_MOBILEWEB) nextRow.left = 10;
    if (OS_ANDROID) {
        nextRow.leftImage = '/images/spacer_10x10.png';
        nextRow.font   = {fontSize: '15sp', fontWeight: 'bold'};
        nextRow.top    = '12dp';
        nextRow.bottom = '12dp';
    }
    if (OS_IOS) {
        nextRow.selectionStyle = Ti.UI.iOS.TableViewCellSelectionStyle.GRAY;
    } else {
        nextRow.backgroundSelectedColor = '#a9a9a9';
    }

    return nextRow;
}

function getPrevRowParams()
{
    var prevRow = {title: L('General_Previous'), color: '#3450A3', className: 'visitorlogPaginator'};
    if (OS_MOBILEWEB) prevRow.left = 10;
    if (OS_ANDROID) {
        prevRow.leftImage = '/images/spacer_10x10.png';
        prevRow.font   = {fontSize: '15sp', fontWeight: 'bold'};
        prevRow.top    = '12dp';
        prevRow.bottom = '12dp';
    }
    if (OS_IOS) {
        prevRow.selectionStyle = Ti.UI.iOS.TableViewCellSelectionStyle.GRAY;
    } else {
        prevRow.backgroundSelectedColor = '#a9a9a9';
    }

    return prevRow;
}

function getNoVisitorsRowParams()
{
    var rowParams = {title: L('Mobile_NoVisitorsShort')};

    if (OS_ANDROID) {
        rowParams.leftImage = '/images/spacer_10x10.png';
        rowParams.color  = '#cccccc';
        rowParams.font   = {fontSize: '16sp', fontWeight: 'bold'};
        rowParams.top    = '12dp';
        rowParams.bottom = '12dp';
    }

    if (OS_MOBILEWEB) {
        rowParams.left = 10;
    }

    if (OS_IOS) {
        rowParams.selectionStyle = Ti.UI.iOS.TableViewCellSelectionStyle.NONE;
    }

    return rowParams;
}

function render()
{
    scrollToTop();
    showReportContent();

    var rows = [];

    var nextRow = Ti.UI.createTableViewRow(getNextRowParams());
    nextRow.addEventListener('click', fetchNext);
    rows.push(nextRow);
    nextRow = null;

    if (visitorLog && visitorLog.length) {
        visitorLog.forEach(function (visitorDetail) {
            if (!visitorDetail) {
                return;
            }

            var accountModel = require('session').getAccount();

            var params = {account: accountModel, visitor: visitorDetail.attributes};
            var visitorOverview = Alloy.createController('visitor_overview', params);
            var visitorRow      = visitorOverview.getView();
            visitorRow.visitor  = visitorDetail.attributes;
            rows.push(visitorRow);
            visitorRow = null;
            visitorOverview = null;
        });
    } else {
        var noVisitsRow = Ti.UI.createTableViewRow(getNoVisitorsRowParams());
        rows.push(noVisitsRow);
        noVisitsRow = null;
    }

    var prevRow = Ti.UI.createTableViewRow(getPrevRowParams());
    prevRow.addEventListener('click', fetchPrevious);
    rows.push(prevRow);
    prevRow = null;

    $.visitorLogTable.setData(rows);

    if (OS_IOS && $.visitorLogTable && $.visitorLogTable.scrollToTop) {
        $.visitorLogTable.scrollToTop();
    }

    rows = null;
}

function showReportContent()
{
    $.content.show();
    $.loadingIndicator.hide();
    $.emptyData && $.emptyData.cleanupIfNeeded();
}

function showLoadingMessage()
{
    $.loadingIndicator.show();
    $.content.hide();
    $.emptyData && $.emptyData.cleanupIfNeeded();
}

function showReportHasNoVisitors(title, message)
{
    $.emptyData.show($.index, doRefresh, title, message);

    $.content.hide();
    $.loadingIndicator.hide();
}

function onFetchError(undefined, error)
{
    if (error) {
        showReportHasNoVisitors(error.getError(), error.getMessage());
    }
}

function doRefresh()
{
    var accountModel = require('session').getAccount();
    var siteModel    = require('session').getWebsite();
    var segmentModel = require('session').getSegment();

    if (!accountModel || !siteModel) {
        console.log('account or site not found, cannot refresh visitor log');
        return;
    }

    showLoadingMessage();

    // TODO fallback to day/today is not a good solution cause user won't notice we've fallen back to a different date
    var reportDate  = require('session').getReportDate();
    var piwikPeriod = reportDate ? reportDate.getPeriodQueryString() : 'day';
    var piwikDate   = reportDate ? reportDate.getDateQueryString() : 'today';

    visitorLog.initial(accountModel, segmentModel, siteModel.id, piwikPeriod, piwikDate);
}

function toggleReportConfiguratorVisibility()
{
    require('report/configurator').toggleVisibility();

    require('Piwik/Tracker').trackEvent({name: 'Toggle Report Configurator', category: 'Visitor Log'});
}

function toggleReportChooserVisibility()
{
    require('report/chooser').toggleVisibility();

    require('Piwik/Tracker').trackEvent({name: 'Toggle Report Chooser', category: 'Visitor Log'});
}

exports.open = function () 
{
    registerEvents();
    require('layout').open($.index);
    doRefresh();
};

function close()
{
    require('layout').close($.index);
}

exports.close   = close;
exports.refresh = doRefresh;