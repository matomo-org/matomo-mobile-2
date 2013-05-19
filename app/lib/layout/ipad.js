/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var navGroup = null;
var isBootstrapped = false;

var detailRootWindow = null;
var recordWindows    = false;
var recordedWindows  = [];

function bootstrap (win)
{
    detailRootWindow = Ti.UI.createWindow();
    navGroup = Ti.UI.iPhone.createNavigationGroup({window: win});
    detailRootWindow.add(navGroup);
    detailRootWindow.open();

    isBootstrapped = true;

    win = null;
}

exports.close = function (win) 
{
    if (!win) {
        return;
    }

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

    recordWindowIfEnabled(win);

    win = null;
};

exports.startRecordingWindows = function () {
    recordWindows = true;
};

exports.closeRecordedWindows = function () {
    while (recordedWindows.length) {
        exports.close(recordedWindows.shift());
    }
};

function recordWindowIfEnabled(win)
{
    if (recordWindows) {
        recordedWindows.push(win);
        win.addEventListener('close', removeWindowFromRecordedWindows);
    }
    
    win = null;
}

function removeWindowFromRecordedWindows()
{
    var _     = require('alloy')._;
    var index = _.indexOf(recordedWindows, this);

    if (-1 != index) {
        delete recordedWindows[index];
    }

    this.removeEventListener('close', removeWindowFromRecordedWindows);
}


var leftSidebarWindow = Ti.UI.createWindow({left: 0, width: 250, barImage: "navbardark.png", barColor: "#2D2D2D"});
leftSidebarWindow.open();

exports.setLeftSidebar = function(view)
{
    leftSidebarWindow.add(view);
    detailRootWindow.left = 250;
};

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

    detailRootWindow.animate(animation);
}

function showRightSidebar()
{
    rightSidebarWindow.show();

    detailRootWindow.animate({
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
};
