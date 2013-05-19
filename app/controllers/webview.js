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

var args     = arguments[0] || {};
var webUrl   = args.url || false;
var webTitle = args.title || false;

function getUrlWithoutProtocolAndQuery(url)
{
    url = url + '';

    var indexOfProtocol = url.indexOf('://');
    if (-1 === indexOfProtocol) {
        indexOfProtocol = 0;
    } else {
        indexOfProtocol += 3;
    }

    var indexOfQuery = url.indexOf('?');
    if (-1 === indexOfQuery) {
        indexOfQuery = url.length;
    }

    return url.substr(indexOfProtocol, indexOfQuery - indexOfProtocol);
}

exports.open = function () {
    $.index.title = webTitle;
    $.webview.url = webUrl;

    require('layout').open($.index);

    var urlToTrack = getUrlWithoutProtocolAndQuery(webUrl);

    require('Piwik/Tracker').trackWindow(urlToTrack, 'webview/' + urlToTrack);
}

function close()
{
    require('layout').close($.index);
}

exports.close = close;