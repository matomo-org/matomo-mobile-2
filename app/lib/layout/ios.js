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

        /**
         * @param win
         * @param animated entryWebsite (offline) -> selectAccount (getting online) -> entryWebsite -> ReportComposite
         *                 ---> results in black screen when animated is true, therefore it is possible to disable
         *                      animation. Afaik only used in entryWebsite controller
         */
        close: function (win, animated) {
            if (!win || !navGroup) {
                return;
            }

            if (!_.isBoolean(animated)) {
                animated = true;
            }

            navGroup.close(win, {animated : animated});
            win = null;
        },

        /**
         * @param win
         * @param animated entryWebsite (offline) -> selectAccount (getting online) -> entryWebsite -> ReportComposite
         *                 ---> results in black screen when animated is true, therefore it is possible to disable
         *                      animation. Afaik only used in entryWebsite controller
         */
        open: function (win, animated) {
            if (!win) {
                return;
            }

            if (!_.isBoolean(animated)) {
                animated = true;
            }

            if (isBootstrapped) {
                navGroup.open(win, {animated : animated});
            } else {
                bootstrap(win);
            }

            this.trigger('open', win);

            win = null;
        }
    });
}

exports = iOsLayout;