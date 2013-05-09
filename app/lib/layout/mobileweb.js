var isBootstrapped = false;
var navGroup = null;
var zIndex = 0;

var rootWindow = null;

function bootstrap (win) 
{
    var NavigationGroup = require('org.piwik.navigationgroup');
    
    rootWindow = Ti.UI.createWindow();
    navGroup   = new NavigationGroup({window: win});
    rootWindow.add(navGroup);
    rootWindow.open();

    isBootstrapped = true;
    win = null;
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







// we have to create this window before any other window, 
// otherwise the menu will be always displayed on top of the root window.
var leftSidebarWindow = Ti.UI.createWindow({left: 0, width: 250, visible: false});
leftSidebarWindow.open();

var leftSidebarOuterWindow;

var leftSidebarVisible = false;
function hideLeftSidebar()
{
    var animation = Ti.UI.createAnimation({
        left: 0,
        duration: 400,
        right: 0,
        curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
    });

    animation.addEventListener('complete', function () {
        leftSidebarWindow.hide();
        leftSidebarOuterWindow.removeEventListener('click', hideLeftSidebar);
        leftSidebarOuterWindow.close();
        leftSidebarOuterWindow = null;
    });

    rootWindow.animate(animation);
    leftSidebarVisible = false;
}

function showLeftSidebar()
{
    leftSidebarOuterWindow = Ti.UI.createWindow({left: 250, right: 0, backgroundColor: 'transparent'});
    leftSidebarOuterWindow.addEventListener('click', hideLeftSidebar);
    leftSidebarOuterWindow.open();

    leftSidebarWindow.show();
    rootWindow.animate({
        left: 250,
        duration: 400,
        right: -250,
        curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
    });

    leftSidebarVisible = true;
}

exports.setLeftSidebar = function(view)
{
    leftSidebarWindow.add(view);
};

exports.hideLeftSidebar = hideLeftSidebar;

exports.toggleLeftSidebar = function ()
{
    leftSidebarVisible ? hideLeftSidebar() : showLeftSidebar();
};











// we have to create this window before any other window, 
// otherwise the menu will be always displayed on top of the root window.
var rightSidebarWindow = Ti.UI.createWindow({right: 0, width: 250, visible: false});
rightSidebarWindow.open();

var rightSidebarOuterWindow;

var rightSidebarVisible = false;

function hideRightSidebar()
{
    var animation = Ti.UI.createAnimation({
        left: 0,
        duration: 400,
        right: 0,
        curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
    });
    
    animation.addEventListener('complete', function () {
        rightSidebarWindow.hide();

        if (!rightSidebarOuterWindow) {
            console.warn('rightSidebarOuterWindow not set in layout');
            return;
        }

        rightSidebarOuterWindow.removeEventListener('click', hideRightSidebar);
        rightSidebarOuterWindow.close();
        rightSidebarOuterWindow = null;
    });

    rootWindow.animate(animation);
    rightSidebarVisible = false;
}

function showRightSidebar()
{
    rightSidebarOuterWindow = Ti.UI.createWindow({left: 0, right: 250, backgroundColor: 'transparent'});
    rightSidebarOuterWindow.addEventListener('click', hideRightSidebar);
    rightSidebarOuterWindow.open();
    rightSidebarWindow.show();

    rootWindow.animate({
        right: 250,
        duration: 400,
        left: -250,
        curve:Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
    });

    rightSidebarVisible = true;
}

exports.setRightSidebar = function(view)
{
    rightSidebarWindow.add(view);
};

exports.hideRightSidebar = hideRightSidebar;

exports.toggleRightSidebar = function()
{
    rightSidebarVisible ? hideRightSidebar() : showRightSidebar();
};