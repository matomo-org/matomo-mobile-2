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

var args    = arguments[0] || {};
var metrics = args.metrics || [];

var options           = [];
var internalNames     = [];
var metricDisplayName = null;

for (var metricInternalName in metrics) {
    if ('label' == metricInternalName) {
        continue;
    }
    
    metricDisplayName = metrics[metricInternalName];
    
    options.push(String(metricDisplayName));
    internalNames.push(String(metricInternalName));
}

if (!OS_ANDROID) {
    options.push(L('SitesManager_Cancel_js'));
}

function doChangeMetric(event)
{
    if (!event || event.cancel === event.index || true === event.cancel || 0 > event.index) {

        return;
    }
    
    $.trigger('metricChosen', internalNames[event.index]);
}

exports.open = function()
{
    var dialog = Ti.UI.createOptionDialog({
        options: options, 
        title: L('Mobile_ChooseMetric'), 
        cancel: OS_ANDROID ? -1 : options.length - 1
    });
    
    dialog.addEventListener('click', doChangeMetric);
    dialog.show();
};