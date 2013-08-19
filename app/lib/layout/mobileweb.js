/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var Alloy = require('alloy');
var Backbone = Alloy.Backbone;
var _ = Alloy._;

function MobileWebLayout(rootWindow)
{
    var navGroup       = null;
    var isBootstrapped = false;

    function bootstrap (win) 
    {
        var NavigationGroup = require('org.piwik.navigationgroup');
        
        navGroup = new NavigationGroup({window: win});
        rootWindow.add(navGroup);
        rootWindow.open();

        isBootstrapped = true;
        win = null;
    }

    _.extend(this, Backbone.Events, {
        close: function (win, animated) {
            if (!win || !navGroup) {
                return;
            }

            if (!_.isBoolean(animated)) {
                animated = true;
            }

            navGroup.close(win, {animated: animated});
            win = null;
        },
        open: function (win) {
            if (!win) {
                return;
            }

            win.zIndex = 0;
            
            if (isBootstrapped) {
                navGroup.open(win, {animated : true});
            } else {
                bootstrap(win);
            }

            this.trigger('open', win);

            win = null;
        }
    });
}

exports = MobileWebLayout;