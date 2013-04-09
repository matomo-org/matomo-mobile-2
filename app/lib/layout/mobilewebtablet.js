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
exports.toggleLeftSidebar = function () {};





// we have to create this window before any other window, 
// otherwise the menu will be always displayed on top of the root window.
var rightSidebarWindow = Ti.UI.createWindow({right: 0, width: 250, visible: false});
rightSidebarWindow.open();

function hideRightSidebar()
{
    var animation = Ti.UI.createAnimation({
        left: 250,
        duration: 400,
        right: 0,
        curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
    });
    
    animation.addEventListener('complete', function () {
        rightSidebarWindow.hide();
    });

    rootWindow.animate(animation);
}

function showRightSidebar()
{
    rightSidebarWindow.show();

    rootWindow.animate({
        right: 250,
        duration: 400,
        left: 0,
        curve:Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
    });
}

exports.setRightSidebar = function(view)
{
    rightSidebarWindow.add(view);
};

exports.hideRightSidebar = hideRightSidebar;

exports.toggleRightSidebar = function()
{
    rightSidebarWindow.visible ? hideRightSidebar() : showRightSidebar();
}
