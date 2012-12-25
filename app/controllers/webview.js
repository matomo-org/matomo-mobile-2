var args     = arguments[0] || {};
var webUrl   = args.url || false;
var webTitle = args.title || false;

function close()
{
    require('layout').close($.index);
    $.destroy();
}

exports.open = function () {
    $.index.title = webTitle;
    $.webview.url = webUrl;

    require('layout').open($.index);
}