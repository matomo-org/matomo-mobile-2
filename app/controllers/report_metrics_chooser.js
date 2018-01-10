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

var args    = arguments[0] || {};
var metrics = args.metrics || {};

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
    options.push(L('General_Cancel'));
}

function doChangeMetric(event)
{
    if (!event || event.cancel === event.index || true === event.cancel || 0 > event.index || event.button) {

        return;
    }

    if (!internalNames || !internalNames[event.index]) {
        console.warn('selected metric cannot be chosen, it is empty', 'report_metric_chooser');
        return;
    }
    
    $.trigger('metricChosen', internalNames[event.index]);
}

exports.open = function()
{
    var params = {
        options: options,
        title: L('Mobile_ChooseMetric'),
        cancel: OS_ANDROID ? -1 : options.length - 1
    };

    if (OS_ANDROID) {
        params.buttonNames = [L('General_Cancel')];
    }

    var dialog = Ti.UI.createOptionDialog(params);
    dialog.addEventListener('click', doChangeMetric);
    dialog.show();
};