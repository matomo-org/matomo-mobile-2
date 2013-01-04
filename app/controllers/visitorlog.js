function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};
var accountModel = args.account;
var siteModel = args.site;

var visitorLog = Alloy.createCollection('piwikLastVisitDetails');
visitorLog.on('fetch', render);

if (OS_IOS) {
    $.pullToRefresh.init($.visitorLogTable);
}

function onFetchPrevious()
{
    visitorLog.previous(account, siteModel.id);
}

function onFetchNext()
{
    visitorLog.next(account, siteModel.id);
}

function render(account, counter30Min, counter24Hours, visitorDetails)
{
    showReportContent();

    var rows = [];

    var row = Ti.UI.createTableViewRow({title: L('General_Next')});
    row.addEventListener('next', onFetchNext)
    rows.push(row);

    visitorLog.forEach(function (visitorDetail) {
        var params = {account: account, visitor: visitorDetail};
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

exports.refresh = doRefresh;