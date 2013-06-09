/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var widthSidebar = '250dp';

function HandheldSidebar()
{

    function createUnderlayWindow(left, right)
    {
        var underlayWindow = Ti.UI.createWindow({left: left, right: right, top: '48dp', zIndex: 997});

        return underlayWindow;
    }

    function createLeftUnderlayWindow()
    {
        var leftUnderlay = createUnderlayWindow(widthSidebar, 0);
        var separator = Ti.UI.createView({backgroundColor: '#000', left: 0, width: '2dp', height: Ti.UI.FILL});
        leftUnderlay.add(separator);
        var separator = Ti.UI.createView({backgroundColor: '#000', left: '2dp', opacity: 0.6, right: 0});
        leftUnderlay.add(separator);
        leftUnderlay.addEventListener('click', hideLeftSidebar);

        return leftUnderlay;
    }

    function createRightUnderlayWindow()
    {
        var rightUnderlay = createUnderlayWindow(0, widthSidebar);
        var separator = Ti.UI.createView({backgroundColor: '#000', right: 0, width: '2dp', height: Ti.UI.FILL});
        rightUnderlay.add(separator);
        var separator = Ti.UI.createView({backgroundColor: '#000', right: '2dp', opacity: 0.6, left: 0});
        rightUnderlay.add(separator);
        rightUnderlay.addEventListener('click', hideRightSidebar);

        return rightUnderlay;
    }

    var leftSidebarView = null;
    var leftSidebarWindow = null;
    var leftSidebarOuterWindow = createLeftUnderlayWindow();

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
        if (view) {
            leftSidebarView = view;
        }
    };

    this.hideLeftSidebar = hideLeftSidebar;
    this.toggleLeftSidebar = toggleLeftSidebar;



    // we have to create this window before any other window, 
    // otherwise the menu will be always displayed on top of the root window.
    var rightSidebarView   = null;
    var rightSidebarWindow = null;
    var rightSidebarOuterWindow = createRightUnderlayWindow();

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
        if (view) {
            rightSidebarView = view;
        }
    };

    this.hideRightSidebar = hideRightSidebar;

    this.toggleRightSidebar = function()
    {
        rightSidebarWindow ? hideRightSidebar() : showRightSidebar();
    };
}

module.exports = HandheldSidebar;