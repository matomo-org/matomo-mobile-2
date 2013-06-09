/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function getTimeoutValues()
{
    return ['15s', '30s', '45s', '60s', '90s', '120s', '150s', '180s', '300s', '450s', '600s', '1000s'];
}

function pressedCancel(event)
{
    // android reports cancel = true whereas iOS returns the previous defined cancel index
    return (!event || event.cancel === event.index || true === event.cancel);
}

function trackTimeoutChange(timeoutValue)
{
    var tracker = require('Piwik/Tracker');
    tracker.trackEvent({title: 'HTTP Timeout Changed',
                        url: '/settings/changed/http-timeout/' + timeoutValue});

}

function changeTimeoutSetting(timeoutValueInMs)
{
    var settings = Alloy.createCollection('AppSettings').settings();
    settings.setHttpTimeout(timeoutValueInMs);
    settings.save();
}

function getCurrentHttpTimeoutName()
{
    var settings = Alloy.createCollection('AppSettings').settings();
    var timeout  = parseInt(settings.httpTimeout(), 10);

    return parseInt(timeout / 1000, 10) + 's';
}

function getSelectedTimeoutInMs(index)
{
    var timeoutValues = getTimeoutValues();

    if (!timeoutValues[index]) {
        return;
    }

    var timeoutValue  = timeoutValues[index];
    timeoutValue      = parseInt(timeoutValue.replace('s', ''), 10) * 1000;

    return timeoutValue;
}

function onTimeoutSelected(event)
{
    if (pressedCancel(event)) {

        return;
    }

    var timeoutValue = getSelectedTimeoutInMs(event.index);

    if (timeoutValue) {
        trackTimeoutChange(timeoutValue);
        changeTimeoutSetting(timeoutValue);
    }
}

exports.getCurrentHttpTimeoutName = getCurrentHttpTimeoutName;

exports.open = function () 
{
    var L = require('L');

    // an array of all available timeout options
    var timeoutValues = getTimeoutValues();
    timeoutValues.push(L('SitesManager_Cancel_js'));

    var timeoutDialog = Ti.UI.createOptionDialog({
        title: L('Mobile_ChooseHttpTimeout'),
        options: timeoutValues,
        cancel: (timeoutValues.length - 1)
    });

    timeoutDialog.addEventListener('click', onTimeoutSelected);

    timeoutDialog.show();
    timeoutDialog = null;
};