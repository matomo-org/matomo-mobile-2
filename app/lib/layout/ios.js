/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var Alloy = require('alloy');
var Backbone = Alloy.Backbone;
var _ = Alloy._;

function iOsLayout(rootWindow)
{
    var isBootstrapped = false;

    function bootstrap (win) 
    {
        rootWindow.window = win;
        rootWindow.open({animated : false});

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
            if (!win) {
                return;
            }

            if (!_.isBoolean(animated)) {
                animated = true;
            }

            rootWindow.closeWindow(win, {animated : false});
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

            if (!isBootstrapped) {
                bootstrap(win);
            }
            
            // TODO it would be nice to be able to make use of animations on the iPad. At the moment enabling animation 
            // causes a weird issue at least on the iPad. To reproduce open Piwik Mobile and make sure All Websites
            // Dashboard is displayed. Wait till the whole screen has finished loading including graph and so on.
            // Open a website --> The right part of the window is too wide resulting in parts of the app is not visible.
            // If you cannot reproduce it the first time, try it a second or a third time.
            animated = animated && Alloy.isHandheld;
            rootWindow.openWindow(win, {animated : animated});

            this.trigger('open', win);

            win = null;
        }
    });
}

exports = iOsLayout;