var openedWindows = [];

function hasOpenedWindow()
{
    return !!openedWindows.length;
}
function getCurrentlyOpenedWindow()
{
    return openedWindows[openedWindows.length - 1];
}

function closeCurrentlyOpenedWindow()
{
    if (hasOpenedWindow()) {
        exports.close(getCurrentlyOpenedWindow());
    }
}

exports.close = function(win) {
    openedWindows.pop();
    win.close();
    win = null;
};

exports.open = function(win) {
    win.addEventListener('androidback', closeCurrentlyOpenedWindow);
    win.open();
    openedWindows.push(win);
    win = null;
};

exports.openSplitWindow = function (detailWindow, detailContent, masterView) 
{
    var masterContainer = Ti.UI.createView({left: 0, width: '200dp'});
    masterContainer.add(masterView);
    detailWindow.add(masterContainer);

    detailContent.left  = '200dp';
    detailContent.right = 0;

    exports.open(detailWindow);
};
