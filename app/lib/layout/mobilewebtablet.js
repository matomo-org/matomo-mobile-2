var isBootstrapped = false;
var navGroup = null;
var zIndex = 0;
var rootWindow = null;

function bootstrap (win) 
{
    rootWindow = Ti.UI.createWindow();
    navGroup = Ti.UI.MobileWeb.createNavigationGroup({window: win});
    rootWindow.add(navGroup);
    rootWindow.open();

    isBootstrapped = true; 
    win = null;
}

function getVerticalSplitViewSeparatorLine()
{
    return Ti.UI.createView({left: 198, width: 2, zIndex: 5, backgroundColor: '#2D2D2D'});
}

exports.close = function (win) 
{
    navGroup.close(win, {animated: true});
    win = null;
};

exports.open = function (win) 
{
    win.zIndex = 0;

    if (isBootstrapped) {
        navGroup.open(win, {animated : true});
    } else {
        bootstrap(win);
    }

    win = null;
};

var leftSidebarWindow = Ti.UI.createWindow({left: 0, width: 250, barImage: "navbardark.png", barColor: "#2D2D2D"});
leftSidebarWindow.open();

exports.setLeftSidebar = function(view)
{
    leftSidebarWindow.add(view);
    rootWindow.left = 250;
}

exports.hideLeftSidebar = function () {};
exports.toggleLeftSidebar = function () {}
