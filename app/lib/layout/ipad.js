var detailNavGroup = null;
var splitWindow    = null;
var navGroup       = null;

exports.bootstrap = function () {};

exports.singleWin = function () 
{
    var rootWindow = Ti.UI.createWindow();
    navGroup = Ti.UI.iPhone.createNavigationGroup({window: controller.getView()});
    rootWindow.add(navGroup);
    rootWindow.open();
};

exports.splitWindow = function (detailViewController, masterViewController) 
{
    detailNavGroup = Ti.UI.iPhone.createNavigationGroup({window: detailViewController.getView()});

    splitWindow = Ti.UI.iPad.createSplitWindow({
        detailView: detailNavGroup,
        masterView: masterViewController.getView()
    });

    splitWindow.addEventListener('visible', function(e)
    {
        if (e.view == 'detail') {
            e.button.title = "Reports";
            this.detailView.leftNavButton = e.button;
        } else if (e.view == 'master') {
            this.detailView.leftNavButton = null;
        }
    });

    splitWindow.open();
};

exports.openInDetailView = function(win) 
{
    detailNavGroup.open(win, {animated: true});
    win = null;
};

exports.close = function(win) 
{
    navGroup.close(win, {animated: true});
    win = null;
};

exports.open = function(win) 
{
    navGroup.open(win, {animated: true});
    win = null;
};