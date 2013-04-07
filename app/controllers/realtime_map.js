function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};
var accountModel = args.account || false;
var siteModel    = args.site || false;

function openRealTimeMapInWebview()
{
    var url = accountModel.getBasePath();
    url    += "index.php?module=Widgetize&action=iframe&widget=1&moduleToWidgetize=UserCountryMap&actionToWidgetize=realtimeMap&idSite=";
    url    += siteModel.id;
    url    += "&period=month&date=today&disableLink=1&widget=1";

    $.webview.url = url;
}

exports.open = function () {

    openRealTimeMapInWebview();

    require('layout').open($.index);
}

function toggleReportMenu(event)
{
    require('layout').toggleLeftSidebar();
}

function close()
{
    require('layout').close($.index);
}

exports.close = close;