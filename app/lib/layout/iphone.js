var navGroup = null;
var isBootstrapped = false;

function bootstrap (win) 
{
    var statisticsWin = Ti.UI.createWindow();
    navGroup = Ti.UI.iPhone.createNavigationGroup({window: win});
    statisticsWin.add(navGroup);
    statisticsWin.open();

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