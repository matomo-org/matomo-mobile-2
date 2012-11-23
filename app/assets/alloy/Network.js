/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/**
 * @class    Network.
 * 
 * @exports  Network as Piwik.Network
 * @static
 */
var Network = {};

/**
 * Encodes url params. Use always this method instead of encodeURI() cause this method will always work.
 * Uses Ti.Network.encodeURIComponent to encode the params. Currently it does not work correct if the string
 * contains the protocol + domain.
 *
 * @example
 * require('Network').encodeUrlParams('?test1=1&test2=2');
 *
 * @returns  {string}  The encoded url params
 */
Network.encodeUrlParams = function (url) {

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
/**
 * We need an url like http://demo.piwik.org/ or http://demo.piwik.org/foo/bar/
 * Therefore we have to add a trailing / if it doesn't exist already or remove for example index.php if url is
 * http://demo.piwik.org/index.php
 *
 * @param    {string}  accessUrl  A piwik access url.
 *
 * @returns  {string}  The formatted access url.
 */
Network.getBasePath = function (accessUrl) {

    if (!accessUrl) {

        return '';
    }
    
    accessUrl = accessUrl + '';

    if ('/' == accessUrl.substr(accessUrl.length - 1, 1)) {

        return accessUrl;
    }

    if ('.php' == accessUrl.substr(accessUrl.length -4, 4).toLowerCase()) {
        var lastSlash = accessUrl.lastIndexOf('/');
        accessUrl     = accessUrl.substr(0, lastSlash + 1);

        return accessUrl;
    }

    accessUrl = accessUrl + '/';

    return accessUrl;
};

module.exports = Network;