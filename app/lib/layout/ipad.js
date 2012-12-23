var detailNavGroup = null;
var splitWindow    = null;

exports.bootstrap = function (detailViewController, masterViewController) 
{
    var statisticsWin = Ti.UI.createWindow();
    detailNavGroup = Ti.UI.iPhone.createNavigationGroup({window: detailViewController.getView()});
    statisticsWin.add(detailNavGroup);

    splitWindow = Ti.UI.iPad.createSplitWindow({
        detailView: statisticsWin,
        masterView: masterViewController.getView()
    });

    splitWindow.open();
    detailViewController.open();
    masterViewController.open();
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