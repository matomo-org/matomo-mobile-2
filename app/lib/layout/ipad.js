var navGroup = null;

exports.bootstrap = function (controller) 
{
    var statisticsWin = Ti.UI.createWindow();
    navGroup = Ti.UI.iPhone.createNavigationGroup({window: controller.getView()});
    statisticsWin.add(navGroup);

    var nav = Ti.UI.iPhone.createNavigationGroup({
       window: Ti.UI.createWindow()
    });

    var splitwin = Ti.UI.iPad.createSplitWindow({
        detailView: statisticsWin,
        masterView: nav,
        showMasterInPortrait: true
    });

    splitwin.open();
    controller.open();
}

exports.close = function (win) 
{
    navGroup.close(win, {animated: true});
    win = null;
}

exports.open = function (win) 
{
    navGroup.open(win, {animated: true});
    win = null;
}