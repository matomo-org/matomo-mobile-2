exports.toggle = function ()
{
    var settings = Alloy.createCollection('AppSettings').settings();

    var enabled  = !settings.areGraphsEnabled();
    settings.setGraphsEnabled(enabled);
    settings.save();

    var action  = enabled ? 'enable' : 'disable';
    var tracker = require('Piwik/Tracker');
    tracker.trackEvent({title: 'Graphs ' + action,
                        url: '/settings/graphs/' + action});
}