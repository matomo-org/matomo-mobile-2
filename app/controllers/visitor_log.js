function L(key)
{
    return require('L')(key);
}

var accountModel = require('session').getAccount();
var siteModel    = require('session').getWebsite();
var reportDate   = require('session').getReportDate();
var visitorLog   = Alloy.createCollection('piwikLastVisitDetails');
visitorLog.on('reset', render);

if (OS_IOS) {
    $.pullToRefresh.init($.visitorLogTable);
}

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

    siteModel    = website;
    accountModel = require('session').getAccount();
    doRefresh();
}

function onDateChanged(date)
{
    require('Piwik/Tracker').trackEvent({title: 'Date Changed', url: '/visitor-log/change/date'});

    reportDate = date;
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
    unregisterEvents();
    $.destroy();
}

function fetchPrevious()
{
    showLoadingMessage();
    visitorLog.previous(accountModel, siteModel.id);

    require('Piwik/Tracker').trackEvent({title: 'Previous Visitors', url: '/visitor-log/previous'});
}

function fetchNext()
{
    showLoadingMessage();
    visitorLog.next(accountModel, siteModel.id);

    require('Piwik/Tracker').trackEvent({title: 'Next Visitors', url: '/visitor-log/next'});
}

function render()
{
    showReportContent();

    var rows = [];

    var row = Ti.UI.createTableViewRow({title: L('General_Next'), color: '#336699'});

    if (OS_MOBILEWEB) row.left = 10;

    row.addEventListener('click', fetchNext)
    rows.push(row);

    if (visitorLog.length) {
        visitorLog.forEach(function (visitorDetail) {
            var params = {account: accountModel, visitor: visitorDetail.attributes};
            var visitorOverview = Alloy.createController('visitor_overview', params);
            var visitorRow      = visitorOverview.getView();
            visitorRow.visitor  = visitorDetail.attributes;
            rows.push(visitorRow);
            visitorRow = null;
        });
    } else {
        var row = Ti.UI.createTableViewRow({title: L('Mobile_NoVisitorFound')});
        rows.push(row);
    }

    var row = Ti.UI.createTableViewRow({title: L('General_Previous'), color: '#336699'});
    
    if (OS_MOBILEWEB) row.left = 10;
    
    row.addEventListener('click', fetchPrevious);
    rows.push(row);

    $.visitorLogTable.setData(rows);

    if (OS_IOS && $.visitorLogTable && $.visitorLogTable.scrollToTop) {
        $.visitorLogTable.scrollToTop();
    }

    rows = null;
}

function showReportContent()
{
    if (OS_IOS) {
        $.pullToRefresh.refreshDone();
    } 

    $.loadingIndicator.hide();
}

function showLoadingMessage()
{
    if (OS_IOS) {
        $.pullToRefresh.refresh();
    } 

    $.loadingIndicator.show();
}

function onFetchError()
{
    console.log('error fetching data');
}

function doRefresh()
{
    showLoadingMessage();

    var period = reportDate.getPeriodQueryString();
    var date   = reportDate.getDateQueryString();

    visitorLog.initial(accountModel, siteModel.id, period, date);
}

function toggleReportConfiguratorVisibility (event)
{
    require('report/configurator').toggleVisibility();

    require('Piwik/Tracker').trackEvent({title: 'Toggle Report Configurator', url: '/visitor-log/toggle-report-configurator'});
}

function toggleReportChooserVisibility(event)
{
    require('report/chooser').toggleVisibility();

    require('Piwik/Tracker').trackEvent({title: 'Toggle Report Chooser', url: '/visitor-log/toggle/report-chooser'});
}

exports.open = function () 
{
    registerEvents();
    doRefresh();
    require('layout').open($.index);
}

function close()
{
    require('layout').close($.index);
}

exports.close   = close;
exports.refresh = doRefresh;