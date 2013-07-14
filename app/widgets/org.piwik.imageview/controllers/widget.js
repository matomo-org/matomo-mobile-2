/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var args = arguments[0] || {};

var errorImage = OS_ANDROID ? '/images/image_load_error.png' : 'image_load_error.png';
var supportsWidthDetectionOfImage = (OS_ANDROID || OS_IOS);

function loadImageViaXhr(imageView, urlToLoad)
{
    // timeout?
    var imageLoader = Ti.Network.createHTTPClient({validatesSecureCertificate: false, 
                                                   enableKeepAlive: false});

    imageLoader.open('GET', urlToLoad);

    imageLoader.onload = function () {

        if (imageView && this.responseData && (this.responseData.width || !supportsWidthDetectionOfImage)) {
            // image view not yet cleaned up?
            imageView.image = this.responseData;
        } else if (imageView) {
            imageView.image = errorImage;
        }
         
        imageLoader = null;
        imageView   = null;
    };
    
    imageLoader.onerror = function () {
        
        if (imageView) {
            imageView.image = errorImage;
        }
        
        imageView   = null;
        imageLoader = null;
    };
 
    imageLoader.send();
}

function doPostLayout() {
    $.trigger('postlayout');
}

function userHasNoInternetConnection()
{
    return (!Ti.Network || !Ti.Network.online);
}

function startsNotWithHttp(url)
{
    url = '' + url;
    url = url.toLowerCase();

    return (-1 == url.indexOf('http'));
}

var urlErrorHandled = null;

function tryAlternativeDownloadMethod(event) {

    if (this.image && errorImage == this.image) {
        // there could be an error while loading the error image :)
        
        return;
    }
    
    if (!this.image || startsNotWithHttp(this.image)) {
        // no image is set or image is not a remote url
        this.image = errorImage;
        
        return;
    }

    if (userHasNoInternetConnection()) {
        this.image = errorImage;
        
        return;
    }

    if (urlErrorHandled == this.image) {
        // don't handle the same error twice. Otherwise we could end up in a loop. But it should handle the error
        // again if the url changes. for example if one sets another url with imageView.image='foo.bar';
        this.image = errorImage;
        
        return;
    }

    urlErrorHandled = this.image;

    loadImageViaXhr(this, this.image);
}

$.image.applyProperties(args);