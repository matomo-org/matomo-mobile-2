var isBootstrapped = false;
var navGroup = null;
var zIndex = 0;

function bootstrap (win) 
{
    var rootWindow = Ti.UI.createWindow();
    navGroup = Ti.UI.MobileWeb.createNavigationGroup({window: win});
    rootWindow.add(navGroup);
    rootWindow.open();
    rootWindow = null;

    isBootstrapped = true; 
    win = null;
}

function getVerticalSplitViewSeparatorLine()
{
    return Ti.UI.createView({left: 198, width: 2, zIndex: 5, backgroundColor: '#2D2D2D'});
}

exports.openSplitWindow = function (detailWindow, detailContent, masterView) 
{
    var masterContainer = Ti.UI.createView({left: 0, width: 198, zIndex: 3});
    masterContainer.add(masterView);
    detailWindow.add(masterContainer);
    detailWindow.add(getVerticalSplitViewSeparatorLine());

    detailContent.left  = 200;
    detailContent.right = 0;

    exports.open(detailWindow);
};

exports.close = function (win) 
{
    navGroup.close(win, {animated: true});
    win = null;
};

exports.open = function (win) 
{
    win.zIndex = zIndex;
    zIndex++;

    if (isBootstrapped) {
        navGroup.open(win, {animated : true});
    } else {
        bootstrap(win);
    }

    win = null;
};
