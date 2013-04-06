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
};

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







var menuWindow = Ti.UI.createWindow({left: 0, width: 250, barImage: "navbardark.png", barColor: "#2D2D2D"});
menuWindow.open();

var isMenuVisible = false;

function hideMenu()
{
    rootWindow.animate({
        left: 0,
        duration: 400,
        right: 0,
        curve:Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
    });
    isMenuVisible = false;
}

function showMenu()
{
    rootWindow.animate({
        left: 250,
        duration: 400,
        right: -250,
        curve:Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
    });
    isMenuVisible = true;
}

exports.setMenuView = function(view)
{
    menuWindow.add(view);
};

exports.hideMenu = hideMenu;

exports.toggleMenu = function ()
{
    isMenuVisible ? hideMenu() : showMenu();
};
