/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var widthLeftSidebar = '250dp';

function TabletSidebar()
{
    var isLeftSidebarSet  = false;

    function initLeftSidebarWindow()
    {
        var leftSidebarWindow = Ti.UI.createWindow({
            left: 0, 
            backgroundColor: '#e5e5e5',
            exitOnClose: true
        });

        leftSidebarWindow.open();

        return leftSidebarWindow;
    }

    this.on('open', function (window) {
        if (isLeftSidebarSet) {
            window.left = widthLeftSidebar;
        }
    });

    this.setLeftSidebar = function(view)
    {
        if (!view) {
            return;
        }

        var leftSidebarWindow = initLeftSidebarWindow();

        view.left  = 0;
        view.width = widthLeftSidebar;
        leftSidebarWindow.add(view);
        isLeftSidebarSet = true;
    };

    this.hideLeftSidebar = function () {};
    this.toggleLeftSidebar = function () {};


    this.setRightSidebar = function() {};
    this.hideRightSidebar = function() {};
    this.toggleRightSidebar = function() {};
}

module.exports = TabletSidebar;