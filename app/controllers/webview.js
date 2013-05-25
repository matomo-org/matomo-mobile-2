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
    $.webview.url = webUrl;

    require('layout').open($.index);

    var urlToTrack = require('url').getUrlWithoutProtocolAndQuery(webUrl);

    require('Piwik/Tracker').trackWindow(urlToTrack, 'webview/' + urlToTrack);
}

function close()
{
    require('layout').close($.index);
}

exports.close = close;