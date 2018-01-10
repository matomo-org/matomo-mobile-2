/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function L(key)
{
    return require('L')(key);
}

exports.toggle = function ()
{
    var settings = Alloy.createCollection('AppSettings').settings();

    var enabled  = !settings.isTrackingEnabled();
    settings.setTrackingEnabled(enabled);
    settings.save();

    var action  = enabled ? 'enabled' : 'disabled';
    var tracker = require('Piwik/Tracker');
    tracker.setCustomVariable(1, 'action', '' + action, 'event');
    tracker.trackEvent({name: 'Anonymous Tracking Changed', action: 'result', category: 'Settings'});

    var alertDialog = Ti.UI.createAlertDialog({
        message: L('Mobile_AskForAnonymousTrackingPermission'),
        buttonNames: [L('General_Ok')]
    });
    
    alertDialog.show();
    alertDialog = null;
};