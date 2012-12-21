var detailNavGroup = null;
var masterNavGroup = null;

exports.bootstrap = function (controller) 
{
    var statisticsWin = Ti.UI.createWindow();
    detailNavGroup = Ti.UI.iPhone.createNavigationGroup({window: controller.getView()});
    statisticsWin.add(detailNavGroup);

    masterNavGroup = Ti.UI.iPhone.createNavigationGroup({
       window: Ti.UI.createWindow()
    });

    var splitwin = Ti.UI.iPad.createSplitWindow({
        detailView: statisticsWin,
        masterView: masterNavGroup,
        showMasterInPortrait: true
    });

    splitwin.open();
    controller.open();
};

exports.setMasterView = function(win) 
{
    masterNavGroup.open(win);
    win = null;
};

exports.close = function(win) 
{
    detailNavGroup.close(win, {animated: true});
    win = null;
};

exports.open = function(win) 
{
    detailNavGroup.open(win, {animated: true});
    win = null;
};