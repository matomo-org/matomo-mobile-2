function L(key)
{
    return require('L')(key);
}

exports.hide = function()
{
    $.loading.hide();
    $.loading.height = 0;
}

exports.show = function()
{
    $.loading.height = Ti.UI.SIZE;
    $.loading.show();
}