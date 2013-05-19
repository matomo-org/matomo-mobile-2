/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

exports.toggle = function ()
{
    var settings = Alloy.createCollection('AppSettings').settings();

    var enabled  = !settings.areGraphsEnabled();
    settings.setGraphsEnabled(enabled);
    settings.save();

    var action  = enabled ? 'enabled' : 'disabled';
    var tracker = require('Piwik/Tracker');
    tracker.trackEvent({title: 'Graphs ' + action,
                        url: '/settings/changed/graphs/' + action});
}