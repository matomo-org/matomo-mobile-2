function L(key)
{
    return require('L')(key);
}

var args     = arguments[0] || {};
var webUrl   = args.url || false;
var webTitle = args.title || false;

exports.open = function () {
    $.index.title = webTitle;
    $.webview.url = webUrl;

    require('layout').open($.index);

    var titleWithoutWhitespace = ('' + webTitle).replace(/\s+/g, '');

    require('Piwik/Tracker').trackWindow(webTitle, 'webview/' + titleWithoutWhitespace);
}

function close()
{
    require('layout').close($.index);
}

exports.close = close;