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