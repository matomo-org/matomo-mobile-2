var args     = arguments[0] || {};
var webUrl   = args.url || false;
var webTitle = args.title || false;

if (OS_IOS) {

    var closeButton = Ti.UI.createButton({
        title: 'Close',
        style: Ti.UI.iPhone.SystemButtonStyle.PLAIN
    });

    closeButton.addEventListener('click', close);

    $.web.leftNavButton = closeButton;
}

function close()
{
    $.index.close();
}

exports.open = function () {
    $.web.title   = webTitle;
    $.webview.url = webUrl;

    $.index.open();
}