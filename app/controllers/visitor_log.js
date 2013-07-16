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

$.emptyData = new (require('ui/emptydata'));

var visitorLog = Alloy.createCollection('piwikLastVisitDetails');
visitorLog.on('reset', render);
visitorLog.on('error', onFetchError);

function registerEvents()
{
    var session = require('session');
    session.on('websiteChanged', onWebsiteChanged);
    session.on('reportDateChanged', onDateChanged);
}

function unregisterEvents()
{
    var session = require('session');
    session.off('websiteChanged', onWebsiteChanged);
    session.off('reportDateChanged', onDateChanged);
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

function onWebsiteChanged(website)
{
    require('Piwik/Tracker').trackEvent({title: 'Website Changed', url: '/visitor-log/change/website'});

    doRefresh();
}

function onDateChanged(date)
{
    if (!date) {
        return;
    }

    require('Piwik/Tracker').trackEvent({title: 'Date Changed', url: '/visitor-log/change/date'});

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
    $.emptyData && $.emptyData.cleanupIfNeeded();
    $.emptyData = null;

    unregisterEvents();
    $.destroy();
    $.off();
}

function fetchPrevious()
{
    var accountModel = require('session').getAccount();
    var siteModel    = require('session').getWebsite();

    showLoadingMessage();
    visitorLog.previous(accountModel, siteModel.id);

    require('Piwik/Tracker').trackEvent({title: 'Previous Visitors', url: '/visitor-log/previous'});
}

function fetchNext()
{
    var accountModel = require('session').getAccount();
    var siteModel    = require('session').getWebsite();

    showLoadingMessage();
    visitorLog.next(accountModel, siteModel.id);

    require('Piwik/Tracker').trackEvent({title: 'Next Visitors', url: '/visitor-log/next'});
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
    var nextRow = {title: L('General_Next'), color: '#336699', className: 'visitorlogPaginator'};
    if (OS_MOBILEWEB) nextRow.left = 10;
    if (OS_ANDROID) {
        nextRow.leftImage = '/images/spacer_10x10.png';
        nextRow.font   = {fontSize: '15sp', fontWeight: 'bold'};
        nextRow.top    = '12dp';
        nextRow.bottom = '12dp';
    }
    if (OS_IOS) {
        nextRow.selectionStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY;
    } else {
        nextRow.backgroundSelectedColor = '#a9a9a9';
    }

    return nextRow;
}

function getPrevRowParams()
{
    var prevRow = {title: L('General_Previous'), color: '#336699', className: 'visitorlogPaginator'};
    if (OS_MOBILEWEB) prevRow.left = 10;
    if (OS_ANDROID) {
        prevRow.leftImage = '/images/spacer_10x10.png';
        prevRow.font   = {fontSize: '15sp', fontWeight: 'bold'};
        prevRow.top    = '12dp';
        prevRow.bottom = '12dp';
    }
    if (OS_IOS) {
        prevRow.selectionStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY;
    } else {
        prevRow.backgroundSelectedColor = '#a9a9a9';
    }

    return prevRow;
}

function render()
{
    scrollToTop();
    showReportContent();

    var rows = [];

    var row = Ti.UI.createTableViewRow(getNextRowParams());
    row.addEventListener('click', fetchNext);
    rows.push(row);
    row = null;

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
        });
    } else {
        var row = Ti.UI.createTableViewRow({title: L('Mobile_NoVisitorsShort')});
        if (OS_IOS) {
            row.selectionStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.NONE;
        }
        rows.push(row);
        row = null;
    }

    var row = Ti.UI.createTableViewRow(getPrevRowParams());
    row.addEventListener('click', fetchPrevious);
    rows.push(row);
    row = null;

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
    $.emptyData.cleanupIfNeeded();
}

function showLoadingMessage()
{
    $.loadingIndicator.show();
    $.content.hide();
    $.emptyData.cleanupIfNeeded();
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

    if (!accountModel || !siteModel) {
        console.log('account or site not found, cannot refresh visitor log');
        return;
    }

    showLoadingMessage();

    // TODO fallback to day/today is not a good solution cause user won't notice we've fallen back to a different date
    var reportDate  = require('session').getReportDate();
    var piwikPeriod = reportDate ? reportDate.getPeriodQueryString() : 'day';
    var piwikDate   = reportDate ? reportDate.getDateQueryString() : 'today';

    visitorLog.initial(accountModel, siteModel.id, piwikPeriod, piwikDate);
}

function toggleReportConfiguratorVisibility()
{
    require('report/configurator').toggleVisibility();

    require('Piwik/Tracker').trackEvent({title: 'Toggle Report Configurator', url: '/visitor-log/toggle/report-configurator'});
}

function toggleReportChooserVisibility()
{
    require('report/chooser').toggleVisibility();

    require('Piwik/Tracker').trackEvent({title: 'Toggle Report Chooser', url: '/visitor-log/toggle/report-chooser'});
}

exports.open = function () 
{
    registerEvents();
    doRefresh();
    require('layout').open($.index);
};

function close()
{
    require('layout').close($.index);
}

exports.close   = close;
exports.refresh = doRefresh;