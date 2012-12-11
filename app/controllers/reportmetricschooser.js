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

options.push('SitesManager_Cancel_js');

$.index.options = options;
$.index.cancel  = options.length - 1;

function doChangeMetric (event) {
    if (!event || event.cancel === event.index || true === event.cancel) {

        return;
    }
    
    $.trigger('metricChosen', internalNames[event.index]);
}

exports.open = function () {
    $.index.show();
}