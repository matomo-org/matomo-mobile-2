function L(key)
{
    return require('L')(key);
}

function onChangeReport ()
{
    $.trigger('chooseReport', {});
}

function onChangeMetric () 
{
    $.trigger('chooseMetric', {});
}

function onChangeDate () 
{
    $.trigger('chooseDate', {});
}

function onFlatten () 
{
    $.trigger('flatten', {});
}

exports.setMetric = function (metricName) 
{
    $.metric.text = metricName + '';
}

exports.setDate = function (displayDate) 
{
    $.date.text = displayDate + '';
}