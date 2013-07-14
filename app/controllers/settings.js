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
                 changeHttpTimeout: changeHttpTimeout};

if (OS_IOS) {
    var margin     = Alloy.isTablet ? 30 : 15
    var footerView = Ti.UI.createView({left: margin, right: margin, height: Ti.UI.SIZE});
    footerView.add(Ti.UI.createLabel({text: L('Mobile_LoginToPiwikToChangeSettings')}));
    $.settingsTable.footerView = footerView;
    footerView = null;
}

function onOpen()
{
    require('Piwik/Tracker').trackWindow('Settings', 'settings');
}

function onClose()
{
    var settings = Alloy.createCollection('AppSettings').settings();
    settings.off('change', updateAllDisplayedSettingsValues);
    settings.off('change:language', updateWindowTitle);

    $.destroy();
    $.off();
}

function onItemClick(event)
{
    if (!event || !$.settingsTable || !$.settingsTable.sections || !$.settingsTable.sections[event.sectionIndex]) {
        return;
    }

    var section = $.settingsTable.sections[event.sectionIndex];
    var item    = section.getItemAt(event.itemIndex);

    if (!item || !item.properties) {
        console.log('cannot handle item click, no item properties');
        return;
    }

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

    if (supportsListView()) {
        setSubtitle($.advanced, 0, httpTimeout);
    } else {
        $.timeout.title = String.format('%s (%s)', L('Mobile_HttpTimeout'), '' + httpTimeout);
    }
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

function setTitle(section, itemIndex, title)
{
    if (!supportsListView() || !section) {
        return;
    }
    
    var item = section.getItemAt(itemIndex);

    if (!item) {
        console.log('set title not possible, no item');
        return;
    }

    if (OS_ANDROID) {
        item.title = {text: title};
    } else {
        item.properties.title = title;
    }

    section.updateItemAt(itemIndex, item, {animated: true});
}

function setSubtitle(section, itemIndex, subtitle)
{
    if (!supportsListView() || !section) {
        return;
    }
    
    var item = section.getItemAt(itemIndex);

    if (!item) {
        console.log('set subtitle not possible, no item');
        return;
    }

    if (OS_ANDROID) {
        item.subtitle = {text: subtitle};
    } else {
        item.properties.subtitle = subtitle;
    }

    section.updateItemAt(itemIndex, item, {animated: true});
}

function setHasCheck(uiRowIfTableView, indexOfItemIfListView, enabled) 
{
    if (!supportsListView()) {
        return uiRowIfTableView.setHasCheck(enabled);
    }

    var item = $.basic.getItemAt(indexOfItemIfListView);

    if (!item) {
        console.log('set has check not possible, no item');
        return;
    }

    if (enabled && OS_ANDROID) {
        item.template = 'checkedTemplate';
    } else if (OS_ANDROID) {
        item.template = 'uncheckedTemplate';
    } else if (enabled) {
        item.properties.accessoryType = Ti.UI.LIST_ACCESSORY_TYPE_CHECKMARK;
    } else {
        item.properties.accessoryType = Ti.UI.LIST_ACCESSORY_TYPE_NONE;
    }
    
    $.basic.updateItemAt(indexOfItemIfListView, item, {animated: true});
}

function updateWindowTitle()
{
    var title = L('General_Settings');

    if (OS_ANDROID) {
        $.headerBar.setTitle(title || '');
    } else {
        $.index.title = title || '';
    }
}

function updateAllDisplayedSettingsValues()
{
    updateWindowTitle();

    if (supportsListView()) {
        setTitle($.basic, 0, L('General_Language'));
        setTitle($.basic, 1, L('Mobile_AnonymousTracking'));
        setTitle($.basic, 2, L('Mobile_EnableGraphsLabel'));
        setTitle($.advanced, 0, L('Mobile_HttpTimeout'));

        updateDisplayedLanguageValue();
    }

    updateDisplayedHttpTimeoutValue();
    updateDisplayedTrackingValue();
    updateDisplayedGraphsValue();
}

exports.close = close;

exports.open = function() 
{
    var settings = Alloy.createCollection('AppSettings').settings();
    settings.on('change', updateAllDisplayedSettingsValues);
    settings.on('change:language', updateWindowTitle);

    updateAllDisplayedSettingsValues();
    updateWindowTitle();
    
    require('layout').open($.index);
};