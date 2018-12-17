/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var widthSidebar = 250;

function HandheldSidebar(detailRootWindow)
{
    // we have to create this window before any other window, 
    // otherwise the menu will be always displayed on top of the root window.
    var leftSidebarWindow = Ti.UI.createWindow({
        left: 0, width: widthSidebar, 
            backgroundColor: 'transparent', barColor: 'transparent',
         visible: false, extendSafeArea: false
    });
    
    leftSidebarWindow.open();

    var leftSidebarOuterWindow;
    var leftSidebarVisible = false;

    function hideLeftSidebar()
    {
        var animation = Ti.UI.createAnimation({
            left: 0,
            duration: 400,
            right: 0,
            curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
        });

        animation.addEventListener('complete', function () {
            leftSidebarWindow.hide();

            if (!leftSidebarOuterWindow) {
                console.warn('leftSidebarOuterWindow not set in layout');
                return;
            }

            leftSidebarOuterWindow.removeEventListener('click', hideLeftSidebar);
            leftSidebarOuterWindow.close();
            leftSidebarOuterWindow = null;
        });

        detailRootWindow.animate(animation);
        leftSidebarVisible = false;
    }

    function showLeftSidebar()
    {
        if (leftSidebarVisible) {
            return;
        }

        leftSidebarVisible = true;

        leftSidebarOuterWindow = Ti.UI.createWindow({
            left: widthSidebar, 
            right: 0, 
            backgroundColor: 'transparent',
            statusBarStyle: Alloy.statusBarStyle, 
            extendSafeArea: false
        });

        leftSidebarOuterWindow.addEventListener('click', hideLeftSidebar);
        leftSidebarOuterWindow.open();

        leftSidebarWindow.show();
        detailRootWindow.animate({
            left: widthSidebar,
            duration: 400,
            right: '-' + widthSidebar,
            curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
        });
    }

    this.setLeftSidebar = function(view)
    {
        if (view) {
            leftSidebarWindow.add(view);
        }
    };

    this.hideLeftSidebar = hideLeftSidebar;

    this.toggleLeftSidebar = function ()
    {
        leftSidebarVisible ? hideLeftSidebar() : showLeftSidebar();
    };



    // we have to create this window before any other window, 
    // otherwise the menu will be always displayed on top of the root window.
    var rightSidebarWindow = Ti.UI.createWindow({
        right: 0, 
        width: widthSidebar, 
        visible: false,
        statusBarStyle: Alloy.statusBarStyle
    });
        
    rightSidebarWindow.open();

    var rightSidebarOuterWindow;

    var rightSidebarVisible = false;

    function hideRightSidebar()
    {
        var animation = Ti.UI.createAnimation({
            left: 0,
            duration: 400,
            right: 0,
            curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
        });
        
        animation.addEventListener('complete', function () {
            rightSidebarWindow.hide();

            if (!rightSidebarOuterWindow) {
                console.warn('rightSidebarOuterWindow not set in layout');
                return;
            }

            rightSidebarOuterWindow.removeEventListener('click', hideRightSidebar);
            rightSidebarOuterWindow.close();
            rightSidebarOuterWindow = null;
        });

        detailRootWindow.animate(animation);
        rightSidebarVisible = false;
    }

    function showRightSidebar()
    {
        if (rightSidebarVisible) {
            return;
        }

        rightSidebarVisible = true;

        rightSidebarOuterWindow = Ti.UI.createWindow({
            left: 0, 
            right: widthSidebar, 
            backgroundColor: 'transparent',
            statusBarStyle: Alloy.statusBarStyle
        });
        rightSidebarOuterWindow.addEventListener('click', hideRightSidebar);
        rightSidebarOuterWindow.open();

        rightSidebarWindow.show();

        detailRootWindow.animate({
            right: widthSidebar,
            duration: 400,
            left: '-' + widthSidebar,
            curve:Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
        });
    }

    this.setRightSidebar = function(view)
    {
        if (view) {
            rightSidebarWindow.add(view);
        }
    };

    this.hideRightSidebar = hideRightSidebar;

    this.toggleRightSidebar = function()
    {
        rightSidebarVisible ? hideRightSidebar() : showRightSidebar();
    };
}

module.exports = HandheldSidebar;