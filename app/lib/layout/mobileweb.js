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
