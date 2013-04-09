var settings = Alloy.createCollection('AppSettings').settings();
settings.on('change:language change:httpTimeout', doRefresh);

function L(key)
{
    return require('L')(key);
}

function onClose()
{
    $.destroy();
}

function doChangeLanguage()
{
    var language = require('settings/changeLanguage');
    language.open();
}

function toggleTrackingEnabled()
{
    var enabled  = !$.tracking.getHasCheck();

    $.tracking.setHasCheck(enabled);
    settings.setTrackingEnabled(enabled);

    var action  = enabled ? 'enable' : 'disable';
    var tracker = require('Piwik/Tracker');
    tracker.trackEvent({title: 'Anonymous Tracking ' + action,
                        url: '/settings/anonymous-tracking/' + action});

    var alertDialog = Ti.UI.createAlertDialog({
        message: L('Mobile_AskForAnonymousTrackingPermission'),
        buttonNames: [L('General_Ok')]
    });
    
    alertDialog.show();
    alertDialog = null;
}

function toggleGraphsEnabled()
{
    var enabled  = !$.graphs.getHasCheck();

    $.graphs.setHasCheck(enabled);
    settings.setGraphsEnabled(enabled);

    var action  = enabled ? 'enable' : 'disable';
    var tracker = require('Piwik/Tracker');
    tracker.trackEvent({title: 'Graphs ' + action,
                        url: '/settings/graphs/' + action});
}

function doChangeHttpTimeout()
{
    var httpTimeout = require('settings/changeHttpTimeout');
    httpTimeout.open();
}

function toggleReportChooserVisibility(event)
{
    require('report/chooser').toggleVisibility();
}

function close() 
{
    require('layout').close($.index);
}

function doRefresh () {

    var settings = Alloy.createController('settings');
    settings.open();

    close();
}

exports.close = close;

exports.open = function() 
{
    require('layout').open($.index);
};