var navGroup = null;
var isBootstrapped = false;

var detailRootWindow = null;

function bootstrap (win)
{
    detailRootWindow = Ti.UI.createWindow();
    navGroup = Ti.UI.iPhone.createNavigationGroup({window: win});
    detailRootWindow.add(navGroup);
    detailRootWindow.open();

    isBootstrapped = true;

    win = null;
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

var leftSidebarWindow = Ti.UI.createWindow({left: 0, width: 250, barImage: "navbardark.png", barColor: "#2D2D2D"});
leftSidebarWindow.open();

exports.setLeftSidebar = function(view)
{
    leftSidebarWindow.add(view);
    detailRootWindow.left = 250;
}

exports.hideLeftSidebar = function () {};
exports.toggleLeftSidebar = function () {}
