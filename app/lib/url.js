/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

/**
 * @private
 */
function encode(param) {
    return Ti.Network.encodeURIComponent(param);
}

exports.startsWithHttp = function(url)
{
    return (url && 0 === (''+url).indexOf('http'));
};

exports.startsWithHttps = function(url)
{
    return (url && 0 === (''+url).indexOf('https'));
};

exports.replaceHttpWithHttps = function(url)
{
    return 'https://' + url.substr(7);
};

exports.addHttpProtocol = function(url)
{
    return 'http://' + url;
};

exports.getAbsolutePath = function (url)
{
    if (!url) {
        return '';
    }

    var posLastSlash = (url + '').lastIndexOf('/');
    var absolutePath = url.substr(0, posLastSlash + 1);

    return absolutePath;
};

exports.endsWithSlash = function (url)
{
    if (!url) {
        return false;
    }

    url             = url + '';
    var lastCharPos = url.length - 1;
    var lastUrlChar = url.substr(lastCharPos, 1);

    return ('/' === lastUrlChar);
};

exports.endsWithPhp = function (url)
{
    if (!url) {
        return false;
    }
    
    url              = url + '';
    var posLast4Char = url.length - 4;
    var last4Chars   = url.substr(posLast4Char, 4);

    return ('.php' === last4Chars.toLowerCase());
};

exports.getUrlWithoutProtocolAndQuery = function (url)
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
};

exports.buildEncodedUrlQuery = function (parameter)
{
    if (!parameter) {

        return '';
    }
    
    var requestUrl = '';

    for (var paramName in parameter) {
        // hack for PiwikBulkApiRequests
        if ('urls' == paramName) {
            for (var index in parameter.urls) {
                var url = parameter.urls[index];
                requestUrl += encode('urls[' + index + ']') + '=';
                for (var key in url) {
                    requestUrl += encode(key) + '%3d' + encode(url[key]) + '%26';
                }

                requestUrl += '&';
            }

            continue;
        }

        requestUrl += encode(paramName) + '=' + encode(parameter[paramName]) + '&';
    }

    return requestUrl;
};