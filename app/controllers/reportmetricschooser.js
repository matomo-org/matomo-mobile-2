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

options.push(L('SitesManager_Cancel_js'));


function doChangeMetric(event)
{
    if (!event || event.cancel === event.index || true === event.cancel) {

        return;
    }
    
    $.trigger('metricChosen', internalNames[event.index]);
}

exports.open = function()
{
    var dialog = Ti.UI.createOptionDialog({
        options: options, 
        title: L('Mobile_ChooseMetric'), 
        cancel: options.length - 1
    });
    
    dialog.addEventListener('click', doChangeMetric);
    dialog.show();
};