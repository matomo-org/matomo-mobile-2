/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var widthSidebar = '250dp';

function HandheldSidebar()
{
    var leftSidebarView = null;
    var leftSidebarWindow = null;
    var leftSidebarOuterWindow = Ti.UI.createWindow({left: widthSidebar, right: 0, backgroundColor: 'transparent', zIndex: 997});
    leftSidebarOuterWindow.addEventListener('click', hideLeftSidebar);

    function hideLeftSidebar()
    {
        if (leftSidebarWindow) {
            leftSidebarWindow.close();
            leftSidebarOuterWindow.close();
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

        leftSidebarWindow = Ti.UI.createWindow({left: 0, top: '48dp', width: widthSidebar, zIndex: 999});
        leftSidebarWindow.add(leftSidebarView);
        leftSidebarWindow.addEventListener('androidback', hideLeftSidebar);
        leftSidebarWindow.open();
        leftSidebarOuterWindow.open();
    }

    this.setLeftSidebar = function(view)
    {
        leftSidebarView = view;
    };

    this.hideLeftSidebar = hideLeftSidebar;
    this.toggleLeftSidebar = toggleLeftSidebar;





    // we have to create this window before any other window, 
    // otherwise the menu will be always displayed on top of the root window.
    var rightSidebarView   = null;
    var rightSidebarWindow = null;
    var rightSidebarOuterWindow = Ti.UI.createWindow({left: 0, right: widthSidebar, backgroundColor: 'transparent', zIndex: 996});
    rightSidebarOuterWindow.addEventListener('click', hideRightSidebar);

    function hideRightSidebar()
    {
        if (rightSidebarWindow) {
            rightSidebarWindow.close();
            rightSidebarOuterWindow.close();
            rightSidebarWindow = null;
        }
    }

    function showRightSidebar()
    {
        if (rightSidebarWindow || !rightSidebarView) {
            return;
        }

        hideLeftSidebar();

        rightSidebarWindow = Ti.UI.createWindow({right: 0, top: '48dp', width: widthSidebar, zIndex: 998});
        rightSidebarWindow.add(rightSidebarView);
        rightSidebarWindow.addEventListener('androidback', hideRightSidebar);
        rightSidebarWindow.open();
        rightSidebarOuterWindow.open();
    }

    this.setRightSidebar = function(view)
    {
        rightSidebarView = view;
    };

    this.hideRightSidebar = hideRightSidebar;

    this.toggleRightSidebar = function()
    {
        rightSidebarWindow ? hideRightSidebar() : showRightSidebar();
    };
}

module.exports = HandheldSidebar;