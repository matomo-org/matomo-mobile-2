function L(key)
{
    return require('L')(key);
}

var callbacks = {changeLanguage: changeLanguage,
                 toggleTrackingEnabled: toggleTrackingEnabled,
                 toggleGraphsEnabled: toggleGraphsEnabled,
                 changeHttpTimeout: changeHttpTimeout}

function onClose()
{
    if (supportsListView()) {
        var settings = Alloy.createCollection('AppSettings').settings();
        settings.off('change', updateAllDisplayedSettingsValues);
    }

    $.destroy();
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
}

function toggleTrackingEnabled()
{
    require('settings/trackingEnabled').toggle();
}

function toggleGraphsEnabled()
{
    require('settings/graphsEnabled').toggle();
}

function changeHttpTimeout()
{
    require('settings/changeHttpTimeout').open();
}

function toggleReportChooserVisibility(event)
{
    require('report/chooser').toggleVisibility();
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