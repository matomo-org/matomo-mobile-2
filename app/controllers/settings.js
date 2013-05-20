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

var callbacks = {changeLanguage: changeLanguage,
                 toggleTrackingEnabled: toggleTrackingEnabled,
                 toggleGraphsEnabled: toggleGraphsEnabled,
                 changeHttpTimeout: changeHttpTimeout}

function onOpen()
{
    require('Piwik/Tracker').trackWindow('Settings', 'settings');
}

function onClose()
{
    if (supportsListView()) {
        var settings = Alloy.createCollection('AppSettings').settings();
        settings.off('change', updateAllDisplayedSettingsValues);
    }

    $.destroy();
    $.off();
}

function onItemClick(event)
{
    var section = $.settingsTable.sections[event.sectionIndex];
    var item    = section.getItemAt(event.itemIndex);

    var callback = item.properties.callback;
    if (callback && callbacks[callback]) {
        callbacks[callback]();
    }
}

function supportsListView()
{
    return (OS_IOS || OS_ANDROID);
}

function changeLanguage()
{
    require('settings/changeLanguage').open();

    require('Piwik/Tracker').trackEvent({title: 'Settings - Change Language', url: '/settings/change/language'});
}

function toggleTrackingEnabled()
{
    require('settings/trackingEnabled').toggle();

    require('Piwik/Tracker').trackEvent({title: 'Settings - Toggle Tracking Enabled', url: '/settings/toggle/tracking-enabled'});
}

function toggleGraphsEnabled()
{
    require('settings/graphsEnabled').toggle();

    require('Piwik/Tracker').trackEvent({title: 'Settings - Toggle Graphs Enabled', url: '/settings/toggle/graphs-enabled'});
}

function changeHttpTimeout()
{
    require('settings/changeHttpTimeout').open();

    require('Piwik/Tracker').trackEvent({title: 'Settings - Change HTTP Timeout', url: '/settings/change/http-timeout'});
}

function toggleReportChooserVisibility(event)
{
    require('report/chooser').toggleVisibility();

    require('Piwik/Tracker').trackEvent({title: 'Toggle Report Chooser', url: '/settings/toggle/report-chooser'});
}

function close() 
{
    callbacks = null;
    
    require('layout').close($.index);
}

function updateDisplayedLanguageValue()
{
    var languageName = require('settings/changeLanguage').getCurrentLanguageName();
    setSubtitle($.basic, 0, languageName);
}

function updateDisplayedHttpTimeoutValue()
{
    var httpTimeout = require('settings/changeHttpTimeout').getCurrentHttpTimeoutName();
    setSubtitle($.advanced, 0, httpTimeout);
}

function updateDisplayedTrackingValue()
{
    var settings = Alloy.createCollection('AppSettings').settings();

    setHasCheck($.tracking, 1, settings.isTrackingEnabled());
}

function updateDisplayedGraphsValue()
{
    var settings = Alloy.createCollection('AppSettings').settings();

    setHasCheck($.graphs, 2, settings.areGraphsEnabled());
}

function setSubtitle(section, itemIndex, subtitle)
{
    var item = section.getItemAt(itemIndex);
    item.properties.subtitle = subtitle;
    section.updateItemAt(itemIndex, item, {animated: true});
}

function setHasCheck(uiRowIfTableView, indexOfItemIfListView, enabled) 
{
    if (!supportsListView()) {
        return uiRowIfTableView.setHasCheck(enabled);
    }

    var item = $.basic.getItemAt(indexOfItemIfListView);

    if (enabled) {
        item.properties.accessoryType = Ti.UI.LIST_ACCESSORY_TYPE_CHECKMARK;
    }  else {
        item.properties.accessoryType = Ti.UI.LIST_ACCESSORY_TYPE_NONE;
    }
    
    $.basic.updateItemAt(indexOfItemIfListView, item, {animated: true});
}

function updateAllDisplayedSettingsValues()
{
    updateDisplayedLanguageValue();
    updateDisplayedHttpTimeoutValue();
    updateDisplayedTrackingValue();
    updateDisplayedGraphsValue();
}

exports.close = close;

exports.open = function() 
{
    if (supportsListView()) {
        var settings = Alloy.createCollection('AppSettings').settings();
        settings.on('change', updateAllDisplayedSettingsValues);
        updateAllDisplayedSettingsValues();
    }

    require('layout').open($.index);
};