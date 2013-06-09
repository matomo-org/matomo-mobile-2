/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

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

function updateContainer(properties)
{
    $.loading.applyProperties(properties);
}

function updateContainerIfSet(property)
{
    if (args && args[property]) {
        var properties = {};
        properties[property] = args[property];
        updateContainer(properties);
    }
}

if (args && args.rounded) {
    updateContainer({
        borderRadius: 5,
        borderColor: "#d3d3d3",
        borderWidth: 1
    });
}

updateContainerIfSet('backgroundColor');
updateContainerIfSet('color');
updateContainerIfSet('width');
updateContainerIfSet('top');

if (args && args.height) {
    updateContainer({height: args.height});
    
    centerLoadingLabel();
}

exports.hide = function()
{
    $.loading.hide();
    $.loading.height = 0;
};

exports.show = function()
{
    if (args && args.height) {
        $.loading.height = args.height;
    } else {
        $.loading.height = Ti.UI.SIZE;
    }

    $.loading.show();
};