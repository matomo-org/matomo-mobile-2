function L(key)
{
    return require('L')(key);
}

function centerLoadingLabel()
{
    $.loadingLabel.top    = null;
    $.loadingLabel.bottom = null;
}

var args = arguments[0] || {};

if (args && args.rounded) {
    $.loading.applyProperties({
        borderRadius: 5,
        borderColor: "#d3d3d3",
        borderWidth: 1
    });
}

if (args && args.height) {
    $.loading.applyProperties({
        height: args.height
    });
    
    centerLoadingLabel();
}

exports.hide = function()
{
    $.loading.hide();
    $.loading.height = 0;
}

exports.show = function()
{
    if (args && args.height) {
        $.loading.height = args.height;
    } else {
        $.loading.height = Ti.UI.SIZE;
    }

    $.loading.show();
}