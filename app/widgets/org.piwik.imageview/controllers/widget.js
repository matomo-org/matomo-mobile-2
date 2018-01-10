/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var args = arguments[0] || {};

var errorImage = OS_ANDROID ? '/images/image_load_error.png' : 'image_load_error.png';
var supportsWidthDetectionOfImage = (OS_ANDROID || OS_IOS);

function doPostLayout() {
    $.trigger('postlayout');
}

exports.loadImage = function (url) {
    $.image.image = url;
};

exports.setWidth = function (width) {
    $.image.width = width;
};

exports.setHeight = function (height) {
    $.image.height = height;
};

exports.getWidth = function()
{
    return require('ui/helper').getWidth($.image);
};

exports.getHeight = function()
{
    return require('ui/helper').getHeight($.image);
};

if (args && args.image) {
    exports.loadImage(args.image);
    delete args.image;
}

$.image.applyProperties(_.omit(args, 'id', '__parentSymbol', '__itemTemplate', '$model'));
