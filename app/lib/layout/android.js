/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var Alloy = require('alloy');
var Backbone = Alloy.Backbone;
var _ = Alloy._;

var numCurrentlyOpenedWindows = 0;

// overlay splashscreen
var win = Ti.UI.createWindow({backgroundColor: "#e5e5e5"});
win.open();

function forceCloseApp()
{
    Ti.Android.currentActivity && Ti.Android.currentActivity.finish();
}

function quitAppIfNoNewWindowOpened()
{
    if (0 >= numCurrentlyOpenedWindows) {
        forceCloseApp();
    }
}

var checkAppShouldBeClosedTimeout = null;

function AndroidLayout()
{
    function close (win) {
        if (!win) {
            return;
        }

        win.removeEventListener('androidback', closeThisWindow);
        win.close();

        if (checkAppShouldBeClosedTimeout) {
            clearTimeout(checkAppShouldBeClosedTimeout);
        }

        numCurrentlyOpenedWindows--;

        if (0 >= numCurrentlyOpenedWindows) {
            checkAppShouldBeClosedTimeout = setTimeout(quitAppIfNoNewWindowOpened, 700);
        }

        win = null;
    }

    function open (win) {
        if (!win) {
            return;
        }

        if (checkAppShouldBeClosedTimeout) {
            clearTimeout(checkAppShouldBeClosedTimeout);
        }

        numCurrentlyOpenedWindows++;
        
        win.addEventListener('androidback', closeThisWindow);
        this.trigger('open', win);

        if (win.left) {
            win.open({left: win.left});
        } else {
            win.open();
        }

        win = null;
    }

    function closeThisWindow()
    {
        close(this);
    }

    _.extend(this, Backbone.Events, {
        close: close,
        open: open
    });
}

module.exports = AndroidLayout;