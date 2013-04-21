function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};

if (args && args.rounded) {
    $.loading.applyProperties({
        borderRadius: 5,
        borderColor: "#d3d3d3",
        borderWidth: 1
    });
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