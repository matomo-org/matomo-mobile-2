/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var widthSidebar = '250dp';

function HandheldSidebar()
{

    function addLeftUnderlay(win)
    {
        var separator = Ti.UI.createView({backgroundColor: '#000', left: widthSidebar, width: '2dp', height: Ti.UI.FILL});
        win.add(separator);
        var background = Ti.UI.createView({backgroundColor: '#000', left: '252dp', opacity: 0.6});
        win.add(background);
        background.addEventListener('click', hideLeftSidebar);
    }

    function addRightUnderlay(win)
    {
        var separator = Ti.UI.createView({backgroundColor: '#000', right: widthSidebar, width: '2dp', height: Ti.UI.FILL});
        win.add(separator);
        var background = Ti.UI.createView({backgroundColor: '#000', right: '252dp', opacity: 0.6});
        win.add(background);
        win.addEventListener('click', hideRightSidebar);
    }

    var leftSidebarView = null;
    var leftSidebarWindow = null;

    function hideLeftSidebar()
    {
        if (leftSidebarWindow) {
            leftSidebarWindow.removeEventListener('androidback', hideLeftSidebar);
            leftSidebarWindow.close();
            leftSidebarWindow = null;
        }
    }

    function toggleLeftSidebar()
    {
        leftSidebarWindow ? hideLeftSidebar() : showLeftSidebar();
    }

    function showLeftSidebar()
    {
        if (leftSidebarWindow || !leftSidebarView) {
            return;
        }

        hideRightSidebar();

        leftSidebarWindow = Ti.UI.createWindow({top: '48dp', zIndex: 999});
        leftSidebarWindow.addEventListener('androidback', hideLeftSidebar);
        leftSidebarWindow.add(leftSidebarView);
        addLeftUnderlay(leftSidebarWindow);

        leftSidebarWindow.open();
    }

    this.setLeftSidebar = function(view)
    {
        if (view) {
            leftSidebarView = view;
            leftSidebarView.left  = 0;
            leftSidebarView.width = widthSidebar;
        }
    };

    this.hideLeftSidebar = hideLeftSidebar;
    this.toggleLeftSidebar = toggleLeftSidebar;


    var rightSidebarView   = null;
    var rightSidebarWindow = null;

    function hideRightSidebar()
    {
        if (rightSidebarWindow) {
            rightSidebarWindow.removeEventListener('androidback', hideRightSidebar);
            rightSidebarWindow.close();
            rightSidebarWindow = null;
        }
    }

    function showRightSidebar()
    {
        if (rightSidebarWindow || !rightSidebarView) {
            return;
        }

        hideLeftSidebar();

        rightSidebarWindow = Ti.UI.createWindow({top: '48dp', zIndex: 998});
        rightSidebarWindow.addEventListener('androidback', hideRightSidebar);
        rightSidebarWindow.add(rightSidebarView);
        addRightUnderlay(rightSidebarWindow);

        rightSidebarWindow.open();
    }

    this.setRightSidebar = function(view)
    {
        if (view) {
            rightSidebarView = view;
            rightSidebarView.right = 0;
            rightSidebarView.width = widthSidebar;
        }
    };

    this.hideRightSidebar = hideRightSidebar;

    this.toggleRightSidebar = function()
    {
        rightSidebarWindow ? hideRightSidebar() : showRightSidebar();
    };
}

module.exports = HandheldSidebar;