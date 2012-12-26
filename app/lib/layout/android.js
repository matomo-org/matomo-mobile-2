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