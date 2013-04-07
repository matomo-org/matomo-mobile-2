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







var leftSidebarWindow = Ti.UI.createWindow({left: 0, width: 250, barImage: "navbardark.png", barColor: "#2D2D2D"});
leftSidebarWindow.open();

var isMenuVisible = false;

function hideLeftSidebar()
{
    rootWindow.animate({
        left: 0,
        duration: 400,
        right: 0,
        curve:Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
    });
    isMenuVisible = false;
}

function showLeftSidebar()
{
    rootWindow.animate({
        left: 250,
        duration: 400,
        right: -250,
        curve:Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
    });
    isMenuVisible = true;
}

exports.setLeftSidebar = function(view)
{
    leftSidebarWindow.add(view);
};

exports.hideLeftSidebar = hideLeftSidebar;

exports.toggleLeftSidebar = function ()
{
    isMenuVisible ? hideLeftSidebar() : showLeftSidebar();
};
