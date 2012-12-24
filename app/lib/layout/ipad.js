var navGroup = null;

exports.bootstrap = function (controller) 
{
    var statisticsWin = Ti.UI.createWindow();
    navGroup = Ti.UI.iPhone.createNavigationGroup({window: controller.getView()});
    statisticsWin.add(navGroup);
    statisticsWin.open();
}

exports.openSplitWindow = function (detailWindow, detailContent, masterView) 
{
    var masterContainer = Ti.UI.createView({left: 0, width: 200});
    masterContainer.add(masterView);
    detailWindow.add(masterContainer);

    detailContent.left  = 200;
    detailContent.right = 0;

    exports.open(detailWindow);
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