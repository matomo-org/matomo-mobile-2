/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var Alloy = require('alloy');
var Backbone = Alloy.Backbone;
var _ = Alloy._;

var numCurrentlyOpenedWindows = 0;

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

function AndroidLayout(rootWin)
{
    // @param animated see iOS layout
    function close (view, animated) {
        if (!view) {
            return;
        }

        rootWin.remove(view);
        view.fireEvent('close', {type: 'close'});

        if (checkAppShouldBeClosedTimeout) {
            clearTimeout(checkAppShouldBeClosedTimeout);
        }

        numCurrentlyOpenedWindows--;

        if (0 >= numCurrentlyOpenedWindows) {
            checkAppShouldBeClosedTimeout = setTimeout(quitAppIfNoNewWindowOpened, 700);
        }

        view = null;
    }

    // @param animated see iOS layout
    function open (view, animated) {
        if (!view) {
            return;
        }

        if (checkAppShouldBeClosedTimeout) {
            clearTimeout(checkAppShouldBeClosedTimeout);
        }

        numCurrentlyOpenedWindows++;

        this.trigger('open', view);

        rootWin.add(view);
        view.fireEvent('open', {type: 'open'});

        view = null;
    }

    _.extend(this, Backbone.Events, {
        close: close,
        open: open
    });
}

module.exports = AndroidLayout;