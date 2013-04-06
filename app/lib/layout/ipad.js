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

var menuWindow = Ti.UI.createWindow({left: 0, width: 250, barImage: "navbardark.png", barColor: "#2D2D2D"});
menuWindow.open();

exports.setMenuView = function(view)
{
    menuWindow.add(view);
    detailRootWindow.left = 250;
}

exports.hideMenu = function () {};
exports.toggleMenu = function () {}
