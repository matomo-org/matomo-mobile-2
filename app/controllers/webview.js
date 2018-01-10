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

function updateWindowTitle(title)
{
    if (OS_ANDROID) {
        $.headerBar.setTitle(title || '');
    } else {
        $.index.title = title || '';
    }
}

var args     = arguments[0] || {};
var webUrl   = args.url || false;
var webTitle = args.title || false;

exports.open = function () {
    updateWindowTitle(webTitle);

    refresh();

    require('layout').open($.index);

    var urlToTrack = require('url').getUrlWithoutProtocolAndQuery(webUrl);
    require('Piwik/Tracker').trackWindow(urlToTrack, 'webview/' + urlToTrack);
};

$.emptyData = new (require('ui/emptydata'));

function refresh()
{
    $.loadingIndicator.show();
    $.emptyData && $.emptyData.cleanupIfNeeded();
    $.browser.hide();

    $.browser.url = webUrl;
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

function onClose()
{
    $.emptyData && $.emptyData.cleanupIfNeeded();
    if (OS_ANDROID && $.browser.release) {
        $.browser.release();
    }
    $.destroy();
    $.off();
}

function close()
{
    require('layout').close($.index);
}

exports.close = close;