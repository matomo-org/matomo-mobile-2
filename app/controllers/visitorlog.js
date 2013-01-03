function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};
var accountModel = args.account;
var siteModel = args.site;

var visitorLog = Alloy.createCollection('piwikLastVisitDetails');

if (OS_IOS) {
    $.pullToRefresh.init($.liveTable);
}

function render(account, counter30Min, counter24Hours, visitorDetails)
{
    showReportContent();

    var rows = [];

    var row = Ti.UI.createTableViewRow({title: _('General_Next')});
    row.addEventListener('next', function () {
        visitorLog.previous();
    })
    rows.push(row);

    _.forEach(visitorDetails, function (visitorDetail) {
        var params = {account: account, visitor: visitorDetail};
        var visitorOverview = Alloy.createController('visitoroverview', params);
        rows.push(visitorOverview.getView());
    });

    var row = Ti.UI.createTableViewRow({title: _('General_Previous')});
    row.addEventListener('click', function () {
        visitorLog.previous();
    });
    rows.push(row);

    $.liveTable.setData(rows);
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
    piwikLiveVisitors.initial(accountModel, siteModel.id, 'today', render, onFetchError);
}

exports.refresh = doRefresh;