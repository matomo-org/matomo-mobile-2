/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */
 
/**
 * @class    An image view is created by the method Piwik.UI.createImageView. 
 *           It should be just used for remote images. That means for image url's starting with http or https.
 *           It creates a normal Titanium Image View and returns it. There's just one difference. It adds an error 
 *           handler. If there occurs any error while trying to load the image, the error handler tries to load the 
 *           image again using the {Titanium.UI.HTTPClient}. 
 *           Example: An error occurs while loading the url https://image.test/xyz.png cause the site has a self signed
 *           certificate. The error handler tries to load the image again with "validatesSecureCertificate=false". Now
 *           it works to load the image. The default "image loader" is not able to load an image from a site with 
 *           self signed certificates. We could always load images that way. But I prefer to use the native way by
 *           default which has more options and should be faster and so on. 
 *           This solution is just a workaround for Piwik installations having a self signed certificate.
 * 
 * @exports  ImageView as Piwik.UI.ImageView
 */
function ImageView () {

}

/**
 * Creates the image view and adds the 'error' event listener.
 * 
 * @param  {Object}  params  See <a href="http://developer.appcelerator.com/apidoc/mobile/latest/Titanium.UI.ImageView-object.html">Titanium API</a> for a list of all available parameters.
 * 
 * @type   Titanium.UI.ImageView
 */
ImageView.prototype.init = function (params) {
    
    var imageView       = Ti.UI.createImageView(params);
    params              = null;
    var urlErrorHandled = null;

    imageView.addEventListener('error', function (event) {

        var errorImage = 'images/image_load_error.png';
        
        if (this.image && errorImage == this.image) {
            // there could be an error while loading the error image :)
            
            return;
        }
        
        if (!this.image || -1 == ('' + this.image).toLowerCase().indexOf('http')) {
            // no image is set or image is not a remote url
            this.image = errorImage;
            
            return;
        }

        if (!Ti.Network || !Ti.Network.online) {
            // no internet connection
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

        // timeout?
        var imageLoader = Ti.Network.createHTTPClient({validatesSecureCertificate: false, 
                                                       enableKeepAlive: false});
        var view        = this;
        
        imageLoader.open('GET', this.image);
        imageLoader.onload = function () {

            if (view && this.responseData) {
                // image view not yet cleaned up?
                view.image = this.responseData;
            }
             
            imageLoader = null;
            view        = null;
        };
        
        imageLoader.onerror = function () {
            
            if (view) {
                view.image = errorImage;
            }
            
            view        = null;
            imageLoader = null;
        };
     
        imageLoader.send();
    });
    
    return imageView;
};

module.exports = ImageView;