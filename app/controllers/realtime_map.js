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

var urlToLoad = null;

function registerEvents()
{
    var session = require('session');
    session.on('websiteChanged', openRealTimeMapInWebview);
    session.on('segmentChanged', openRealTimeMapInWebview);
}

function unregisterEvents()
{
    var session = require('session');
    session.off('websiteChanged', openRealTimeMapInWebview);
    session.off('segmentChanged', openRealTimeMapInWebview);
}

function trackWindowRequest()
{
    require('Piwik/Tracker').trackWindow('Real-time Map', 'real-time-map');
}

$.emptyData = new (require('ui/emptydata'));

function refresh()
{
    if (!urlToLoad) {
        return;
    }

    $.loadingIndicator.show();
    $.emptyData && $.emptyData.cleanupIfNeeded();
    $.browser.hide();

    $.browser.url = urlToLoad;
}

function onErrored(event)
{
    if (event && event.error) {
        var message = event.error + ' (code ' + event.code + ')';
        $.emptyData.show($.index, refresh, L('Mobile_NetworkError'), message);
        $.loadingIndicator.hide();
        $.browser.hide();
    } else {
        onLoaded();
    }
}

function onLoaded()
{
    $.browser.show();
    $.loadingIndicator.hide();
    $.emptyData && $.emptyData.cleanupIfNeeded();
}

function onOpen()
{
    trackWindowRequest();
}

function onClose()
{
    unregisterEvents();
    $.emptyData && $.emptyData.cleanupIfNeeded();
    if (OS_ANDROID && $.browser.release) {
        $.browser.release();
    }
    $.destroy();
    $.off();
}

function openRealTimeMapInWebview()
{
    var accountModel = require('session').getAccount();
    var siteModel    = require('session').getWebsite();
    var segmentModel = require('session').getSegment();

    if (!accountModel || !siteModel) {
        return;
    }

    var url = accountModel.getBasePath();
    url    += "index.php?module=Widgetize&action=iframe&widget=1&moduleToWidgetize=UserCountryMap&actionToWidgetize=realtimeMap&idSite=";
    url    += siteModel.id;
    url    += "&period=month&date=today&disableLink=1&widget=1&token_auth=";
    url    += accountModel.getAuthToken();

    if (segmentModel) {
        url += '&segmentOverride=1&segment=' + segmentModel.getDefinition();
    }

    urlToLoad = url;
    refresh();
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