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

function onWebsiteChanged(website)
{
    siteModel    = website;
    accountModel = require('session').getAccount();
    doRefresh();
}

function onDateChanged(date)
{
    reportDate = date;
    doRefresh();
}

function onClose()
{
    unregisterEvents();
    $.destroy();
}

function fetchPrevious()
{
    visitorLog.previous(accountModel, siteModel.id);
}

function fetchNext()
{
    visitorLog.next(accountModel, siteModel.id);
}

function render()
{
    showReportContent();

    var rows = [];

    var row = Ti.UI.createTableViewRow({title: L('General_Next')});
    row.addEventListener('click', fetchNext)
    rows.push(row);

    visitorLog.forEach(function (visitorDetail) {
        var params = {account: accountModel, visitor: visitorDetail.attributes};
        var visitorOverview = Alloy.createController('visitor_overview', params);
        rows.push(visitorOverview.getView());
    });

    var row = Ti.UI.createTableViewRow({title: L('General_Previous')});
    row.addEventListener('click', fetchPrevious);
    rows.push(row);

    $.visitorLogTable.setData(rows);

    if ($.visitorLogTable && $.visitorLogTable.scrollToTop) {
        $.visitorLogTable.scrollToTop();
    }
    
    rows = null;
}

function showReportContent()
{
    if (OS_IOS) {
        $.pullToRefresh.refreshDone();
    } 

    $.loadingindicator.hide();
}

function showLoadingMessage()
{
    if (OS_IOS) {
        $.pullToRefresh.refresh();
    } 

    $.loadingindicator.show();
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

function toggleReportChooserVisibility(event)
{
    require('report/chooser').toggleVisibility();
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