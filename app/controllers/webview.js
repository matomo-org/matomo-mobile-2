var args     = arguments[0] || {};
var webUrl   = args.url || false;
var webTitle = args.title || false;

function close()
{
    require('alloy').Globals.layout.close($.index);
}

exports.open = function () {
    $.index.title = webTitle;
    $.webview.url = webUrl;

    require('layout').open($.index);
}