var args     = arguments[0] || {};
var webUrl   = args.url || false;
var webTitle = args.title || false;

if (OS_IOS) {

    var closeButton = Ti.UI.createButton({
        title: 'Close',
        style: Ti.UI.iPhone.SystemButtonStyle.PLAIN
    });

    closeButton.addEventListener('click', function(){
        $.index.close();
    });

    $.web.leftNavButton = closeButton;
}

exports.open = function () {
    $.web.title   = webTitle;
    $.webview.url = webUrl;

    $.index.open();
}