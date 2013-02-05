function L(key)
{
    return require('L')(key);
}

function onChangeReport ()
{
    $.trigger('chooseReport', {});
}

function onChangeDate ()
{
    $.trigger('chooseDate', {});
}
