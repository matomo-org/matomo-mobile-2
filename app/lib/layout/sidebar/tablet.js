/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var widthLeftSidebar = 250;

function TabletSidebar(detailRootWindow)
{
    // we have to create this window before any other window, 
    // otherwise the menu will be always displayed on top of the root window.
    var leftSidebarWindow = Ti.UI.createWindow({
        left: 0, 
        width: widthLeftSidebar, 
        barImage: "navbardark.png", 
        barColor: "#2D2D2D"
    });
    leftSidebarWindow.open();

    this.setLeftSidebar = function(view)
    {
        if (!view) {
            return;
        }
        
        leftSidebarWindow.add(view);
        detailRootWindow.left = widthLeftSidebar;
    };

    this.hideLeftSidebar = function () {};
    this.toggleLeftSidebar = function () {};


    this.setRightSidebar = function() {};
    this.hideRightSidebar = function() {};
    this.toggleRightSidebar = function() {};
}

module.exports = TabletSidebar;