/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var widthSidebar = '250dp';

function HandheldSidebar()
{
    var leftSidebarContainer  = false;
    var rightSidebarContainer = false;

    var leftSidebarView  = null;
    var rightSidebarView = null;

    var layout = this;

    function addLeftUnderlay(win)
    {
        var separator = Ti.UI.createView({backgroundColor: '#000', left: widthSidebar, width: '2dp', height: Ti.UI.FILL});
        win.add(separator);
        var background = Ti.UI.createView({backgroundColor: '#000', left: '252dp', opacity: 0.6});
        win.add(background);
        background.addEventListener('click', hideLeftSidebar);

        separator  = null;
        background = null;
    }

    function addRightUnderlay(win)
    {
        var separator = Ti.UI.createView({backgroundColor: '#000', right: widthSidebar, width: '2dp', height: Ti.UI.FILL});
        win.add(separator);
        var background = Ti.UI.createView({backgroundColor: '#000', right: '252dp', opacity: 0.6});
        win.add(background);
        win.addEventListener('click', hideRightSidebar);

        separator  = null;
        background = null;
    }

    function hideLeftSidebar()
    {
        if (leftSidebarContainer) {
            layout.close(leftSidebarContainer);
            leftSidebarContainer = null;
        }
    }

    function toggleLeftSidebar()
    {
        leftSidebarContainer ? hideLeftSidebar() : showLeftSidebar();
    }

    function showLeftSidebar()
    {
        if (leftSidebarContainer || !leftSidebarView) {
            return;
        }

        if (rightSidebarContainer) {
            hideRightSidebar();
        }

        leftSidebarContainer = Ti.UI.createView({top: '48dp', zIndex: 999});
        leftSidebarContainer.add(leftSidebarView);
        addLeftUnderlay(leftSidebarContainer);

        layout.open(leftSidebarContainer);
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

    function hideRightSidebar()
    {
        if (rightSidebarContainer) {
            layout.close(rightSidebarContainer);
            rightSidebarContainer = null;
        }
    }

    function showRightSidebar()
    {
        if (rightSidebarContainer || !rightSidebarView) {
            return;
        }

        if (leftSidebarContainer) {
            hideLeftSidebar();
        }

        rightSidebarContainer = Ti.UI.createView({top: '48dp', zIndex: 998});
        rightSidebarContainer.add(rightSidebarView);
        addRightUnderlay(rightSidebarContainer);

        layout.open(rightSidebarContainer);
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
        rightSidebarContainer ? hideRightSidebar() : showRightSidebar();
    };
}

module.exports = HandheldSidebar;