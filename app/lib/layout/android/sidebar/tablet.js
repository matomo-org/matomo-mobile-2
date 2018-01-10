/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var widthLeftSidebar = '250dp';

function TabletSidebar(rootWindow)
{
    var isLeftSidebarSet = false;

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

        isLeftSidebarSet = true;

        view.left  = 0;
        view.width = widthLeftSidebar;
        rootWindow.add(view);
    };

    this.hideLeftSidebar = function () {};
    this.toggleLeftSidebar = function () {};

    this.setRightSidebar = function() {};
    this.hideRightSidebar = function() {};
    this.toggleRightSidebar = function() {};
}

module.exports = TabletSidebar;