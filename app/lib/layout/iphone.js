var navGroup = null;

exports.bootstrap = function (controller) 
{
    var statisticsWin = Ti.UI.createWindow();
    navGroup = Ti.UI.iPhone.createNavigationGroup({window: controller.getView()});
    statisticsWin.add(navGroup);
    statisticsWin.open();
}

exports.close = function (win) 
{
    navGroup.close(win, {animated : true});
    win = null;
}

exports.open = function (win) 
{
    navGroup.open(win, {animated : true});
    win = null;
}