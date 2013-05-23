/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var widthLeftSidebar = '250dp';

function TabletSidebar()
{
    // we have to create this window before any other window, 
    // otherwise the menu will be always displayed on top of the root window.
    var leftSidebarWindow = Ti.UI.createWindow({
        left: 0, 
        width: widthLeftSidebar
    });
    leftSidebarWindow.open();

    this.on('open', function (window) {
        window.left = widthLeftSidebar;
        window.activity.onPrepareOptionsMenu = function(e) {
            this.actionBar.backgroundImage = '/navbar.png';
        };
    });

    this.setLeftSidebar = function(view)
    {
        leftSidebarWindow.add(view);
    };

    this.hideLeftSidebar = function () {};
    this.toggleLeftSidebar = function () {};


    this.setRightSidebar = function() {};
    this.hideRightSidebar = function() {};
    this.toggleRightSidebar = function() {};
}

module.exports = TabletSidebar;