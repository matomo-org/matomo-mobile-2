/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var Alloy = require('alloy');
var Backbone = Alloy.Backbone;
var _ = Alloy._;

function AndroidLayout()
{
    function close (win) {
        if (!win) {
            return;
        }

        win.close();

        win = null;
    }

    function open (win) {
        if (!win) {
            return;
        }
        
        win.addEventListener('androidback', closeThisWindow);
        this.trigger('open', win);
        win.open();

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