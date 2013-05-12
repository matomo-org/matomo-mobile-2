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
}