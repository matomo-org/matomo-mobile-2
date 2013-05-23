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

    function hideLeftSidebar()
    {
        if (leftSidebarWindow) {
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

        leftSidebarWindow = Ti.UI.createWindow({left: 0, width: widthSidebar});
        leftSidebarWindow.add(leftSidebarView);
        leftSidebarWindow.addEventListener('androidback',hideLeftSidebar);
        leftSidebarWindow.open();
    }

    this.setLeftSidebar = function(view)
    {
        leftSidebarView = view;
    };

    this.hideLeftSidebar = hideLeftSidebar;
    this.toggleLeftSidebar = toggleLeftSidebar;



    this.on('open', function (window) {
        var displayMenuLogo = !!leftSidebarView;
        window.activity.onPrepareOptionsMenu = function(e) {
            var actionBar  = this.actionBar;
            if (displayMenuLogo) {
                actionBar.logo = '/ic_action_menu.png';
            } 
            actionBar.backgroundImage = '/navbar.png';
            actionBar.onHomeIconItemSelected = toggleLeftSidebar;
        };
    });



    // we have to create this window before any other window, 
    // otherwise the menu will be always displayed on top of the root window.
    var rightSidebarView = null;
    var rightSidebarWindow = null;
    function hideRightSidebar()
    {
        if (rightSidebarWindow) {
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

        rightSidebarWindow = Ti.UI.createWindow({right: 0, width: widthSidebar});
        rightSidebarWindow.add(rightSidebarView);
        rightSidebarWindow.addEventListener('androidback', hideRightSidebar);
        rightSidebarWindow.open();
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