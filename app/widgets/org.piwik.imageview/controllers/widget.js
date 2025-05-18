/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var args = arguments[0] || {};

var errorImage = OS_ANDROID ? '/images/image_load_error.png' : 'image_load_error.png';
var supportsWidthDetectionOfImage = (OS_ANDROID || OS_IOS);

var validateSsl = true;

function loadImageViaXhr(imageView, urlToLoad)
{
    if ($.imageLoader && $.imageLoader.abort) {
        $.imageLoader.abort();
        $.imageLoader = null;
    }

    var accountsCollection = Alloy.Collections.appAccounts;
    var accountModel = accountsCollection.lastUsedAccount();
    if (!accountModel) {
        return;
    }
    var tokenAuth = accountModel.getAuthToken();

    $.imageLoader = Ti.Network.createHTTPClient({validatesSecureCertificate: !!validateSsl,
        enableKeepAlive: false});

    $.imageLoader.timeout = (1000 * 60 * 2); // 2 minutes

    $.imageLoader.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    $.imageLoader.open('POST', urlToLoad);

    $.imageLoader.onload = function () {

        if (imageView && this.responseData && (this.responseData.width || !supportsWidthDetectionOfImage)) {
            // image view not yet cleaned up?
            imageView.image = this.responseData;
        } else if (imageView) {
            imageView.image = errorImage;
        }

        $.imageLoader = null;
        imageView = null;
    };

    $.imageLoader.onerror = function () {
        if (imageView) {
            imageView.image = errorImage;
        }

        imageView = null;
        $.imageLoader = null;
    };

    $.imageLoader.send('token_auth=' + encodeURIComponent(tokenAuth));
}

function doPostLayout() {
    $.trigger('postlayout');
}

exports.loadImage = function (url) {
    loadImageViaXhr($.image, url);
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
