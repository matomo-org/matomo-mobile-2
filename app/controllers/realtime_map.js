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

function trackWindowRequest()
{
    require('Piwik/Tracker').trackWindow('Real-time Map', 'real-time-map');
}

function onOpen()
{
    trackWindowRequest();
}

function onClose()
{
    unregisterEvents();
    $.destroy();
    $.off();
}

function openRealTimeMapInWebview()
{
    var accountModel = require('session').getAccount();
    var siteModel    = require('session').getWebsite();

    if (!accountModel || !siteModel) {
        return;
    }

    var url = accountModel.getBasePath();
    url    += "index.php?module=Widgetize&action=iframe&widget=1&moduleToWidgetize=UserCountryMap&actionToWidgetize=realtimeMap&idSite=";
    url    += siteModel.id;
    url    += "&period=month&date=today&disableLink=1&widget=1&token_auth=";
    url    += accountModel.getAuthToken();

    $.webview.url = url;
}

exports.open = function () 
{
    require('layout').open($.index);

    openRealTimeMapInWebview();

    registerEvents();
}

function toggleReportConfiguratorVisibility (event)
{
    require('report/configurator').toggleVisibility();

    require('Piwik/Tracker').trackEvent({name: 'Toggle Report Configurator', category: 'Real time map'});
}

function toggleReportChooserVisibility(event)
{
    require('report/chooser').toggleVisibility();
    
    require('Piwik/Tracker').trackEvent({name: 'Toggle Report Chooser', category: 'Real time map'});
}

function close()
{
    require('layout').close($.index);
}

exports.close = close;