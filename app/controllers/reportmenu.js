function onChangeReport ()
{
    $.trigger('changeReport', {});
}

function onChangeMetric () 
{
    $.trigger('changeMetric', {});
}

function onChangeDate () 
{
    $.trigger('changeDate', {});
}

function onFlatten () 
{
    $.trigger('flatten', {});
}