/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

exports.toggle = function ()
{
    var settings = Alloy.createCollection('AppSettings').settings();

    var enabled  = !settings.shouldValidateSsl();
    settings.setValidateSsl(enabled);
    settings.save();

    var action  = enabled ? 'enabled' : 'disabled';
    var tracker = require('Piwik/Tracker');
    tracker.setCustomVariable(1, 'action', '' + action, 'event');
    tracker.trackEvent({name: 'Validate SSL Changed', action: 'result', category: 'Settings'});
};