var args     = arguments[0] || {};
var webUrl   = args.url || false;
var webTitle = args.title || false;

exports.open = function () {
    $.web.title   = webTitle;
    $.webview.url = webUrl;

    $.index.open();
}