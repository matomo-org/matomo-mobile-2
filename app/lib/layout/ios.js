/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var Alloy = require('alloy');
var Backbone = Alloy.Backbone;
var _ = Alloy._;

function iOsLayout(rootWindow)
{
    var navGroup = null;
    var isBootstrapped = false;

    function bootstrap (win) 
    {
        navGroup   = Ti.UI.iPhone.createNavigationGroup({window: win});
        rootWindow.add(navGroup);
        rootWindow.open();

        isBootstrapped = true;

        win = null;
    }

    _.extend(this, Backbone.Events, {
        close: function (win) {
            if (!win) {
                return;
            }

            navGroup.close(win, {animated : true});
            win = null;
        },
        open: function (win) {
            if (isBootstrapped) {
                navGroup.open(win, {animated : true});
            } else {
                bootstrap(win);
            }

            this.trigger('open', win);

            win = null;
        }
    });
};

exports = iOsLayout;