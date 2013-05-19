/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

exports.startsWithHttp = function(url)
{
    return (url && 0 === url.indexOf('http'));
};

exports.addHttpProtocol = function(url)
{
    return 'http://' + url;
};

exports.getAbsolutePath = function (url)
{
    var posLastSlash = url.lastIndexOf('/');
    var absolutePath = url.substr(0, posLastSlash + 1);

    return absolutePath;
}

exports.endsWithSlash = function (url)
{
    url             = url + '';
    var lastCharPos = url.length - 1;
    var lastUrlChar = url.substr(lastCharPos, 1);

    return ('/' === lastUrlChar);
};

exports.endsWithPhp = function (url)
{
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