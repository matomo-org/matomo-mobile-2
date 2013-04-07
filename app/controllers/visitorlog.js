function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};
var accountModel = args.account;
var siteModel    = args.site;

var visitorLog = Alloy.createCollection('piwikLastVisitDetails');
visitorLog.on('fetch', render);

if (OS_IOS) {
    $.pullToRefresh.init($.visitorLogTable);
}

function onFetchPrevious()
{
    visitorLog.previous(accountModel, siteModel.id);
}

function onFetchNext()
{
    visitorLog.next(accountModel, siteModel.id);
}

function render()
{
    showReportContent();

    var rows = [];

    var row = Ti.UI.createTableViewRow({title: L('General_Next')});
    row.addEventListener('click', onFetchNext)
    rows.push(row);

    visitorLog.forEach(function (visitorDetail) {
        var params = {account: accountModel, visitor: visitorDetail.attributes};
        var visitorOverview = Alloy.createController('visitoroverview', params);
        rows.push(visitorOverview.getView());
    });

    var row = Ti.UI.createTableViewRow({title: L('General_Previous')});
    row.addEventListener('click', onFetchPrevious);
    rows.push(row);

    $.visitorLogTable.setData(rows);
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
    visitorLog.initial(accountModel, siteModel.id, 'today');
}

function toggleReportMenu(event)
{
    require('layout').toggleLeftSidebar();
}

exports.open = function () 
{
    doRefresh();
    require('layout').open($.index);
}

function close()
{
    require('layout').close($.index);
}

exports.close   = close;
exports.refresh = doRefresh;