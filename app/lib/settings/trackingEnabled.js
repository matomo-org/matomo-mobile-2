/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
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
    tracker.trackEvent({title: 'Anonymous Tracking ' + action,
                        url: '/settings/changed/anonymous-tracking/' + action});

    var alertDialog = Ti.UI.createAlertDialog({
        message: L('Mobile_AskForAnonymousTrackingPermission'),
        buttonNames: [L('General_Ok')]
    });
    
    alertDialog.show();
    alertDialog = null;
};