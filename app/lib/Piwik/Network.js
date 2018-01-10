/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

/**
 * Matomo - Web Analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/**
 * Encodes url params. Use always this method instead of encodeURI() cause this method will always work.
 * Uses Ti.Network.encodeURIComponent to encode the params. Currently it does not work correct if the string
 * contains the protocol + domain.
 *
 * @example
 * require('network').encodeUrlParams('?test1=1&test2=2');
 *
 * @returns  {string}  The encoded url params
 */
exports.encodeUrlParams = function (url) {

    url            = url + '';

    var encodedURI = '';

    if ('?' == url.substring(0, 1)) {
        url        = url.substring(1);
        encodedURI = '?';
    }

    var paramArray = url.split("&");
    
    for (var index = 0; index < paramArray.length; index++) {
        var keyValue      = paramArray[index].split("=");
        
        if (keyValue[0]) {
            keyValue[0]   = Ti.Network.encodeURIComponent(keyValue[0]);
        }
        
        if (keyValue[1]) {
            keyValue[1]   = Ti.Network.encodeURIComponent(keyValue[1]);
        }
        
        paramArray[index] = keyValue.join("=");
    }
    
    encodedURI = encodedURI + paramArray.join("&");
    paramArray = null;
    url        = null;
    
    return encodedURI;
};