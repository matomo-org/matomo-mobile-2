function L(key)
{
    return require('L')(key);
}

function registerEvents()
{
    var session = require('session');
    session.on('websiteChanged', openRealTimeMapInWebview);
}

function unregisterEvents()
{
    var session = require('session');
    session.off('websiteChanged', openRealTimeMapInWebview);
}

function onClose()
{
    unregisterEvents();
    $.destroy();
}

function openRealTimeMapInWebview()
{
    var accountModel = require('session').getAccount();
    var siteModel    = require('session').getWebsite();

    var url = accountModel.getBasePath();
    url    += "index.php?module=Widgetize&action=iframe&widget=1&moduleToWidgetize=UserCountryMap&actionToWidgetize=realtimeMap&idSite=";
    url    += siteModel.id;
    url    += "&period=month&date=today&disableLink=1&widget=1";

    $.webview.url = url;
}

exports.open = function () 
{
    openRealTimeMapInWebview();
    registerEvents();

    require('layout').open($.index);
}

function toggleReportChooserVisibility(event)
{
    require('report/chooser').toggleVisibility();
}

function close()
{
    require('layout').close($.index);
}

exports.close = close;