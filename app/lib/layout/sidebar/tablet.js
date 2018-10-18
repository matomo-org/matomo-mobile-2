/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
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
        barColor: "#2D2D2D"
    });    
    
    if (Alloy.isIOS7OrLater) {
        // otherwise visible in status bar
        leftSidebarWindow.top = 20;
        leftSidebarWindow.statusBarStyle = Alloy.statusBarStyle;
    }
    
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