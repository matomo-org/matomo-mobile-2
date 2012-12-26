var navGroup = null;
var isBootstrapped = false;

function bootstrap (win)
{
    var statisticsWin = Ti.UI.createWindow();
    navGroup = Ti.UI.iPhone.createNavigationGroup({window: win});
    statisticsWin.add(navGroup);
    statisticsWin.open();

    isBootstrapped = true;

    win = null;
};

exports.openSplitWindow = function (detailWindow, detailContent, masterView) 
{
    var masterContainer = Ti.UI.createView({left: 0, width: 200});
    masterContainer.add(masterView);
    detailWindow.add(masterContainer);

    detailContent.left  = 200;
    detailContent.right = 0;

    exports.open(detailWindow);
};

exports.close = function (win) 
{
    navGroup.close(win, {animated : true});
    win = null;
};

exports.open = function (win) 
{
    if (isBootstrapped) {
        navGroup.open(win, {animated : true});
    } else {
        bootstrap(win);
    }

    win = null;
};
