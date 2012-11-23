/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/**
 * Platform.
 * 
 * @exports  platform as Piwik.Platform
 * @static
 * @class
 */
var platform       = {};

/**
 * The name of the current platform (lowercase).
 *
 * @type  string
 */
platform.osName    = ('' + Ti.Platform.osname).toLowerCase();

/**
 * True if the current platform is android, false otherwise.
 *
 * @type  boolean
 */
platform.isAndroid = ('android' === platform.osName);

/**
 * True if the current platform is mobile web / browser, false otherwise.
 *
 * @type  boolean
 */
platform.isWeb     = ('mobileweb' === platform.osName);

/**
 * True if the current platform is iOS (iPod or iPad or iPhone), false otherwise.
 *
 * @type  boolean
 */
platform.isIos     = ('i' === platform.osName.substr(0, 1));

/**
 * True if the current device is an iPad, false otherwise.
 *
 * @type  boolean
 */
platform.isIpad    = ('ipad' === platform.osName);

/**
 * True if the current device is an iPhone or iPod, false otherwise.
 *
 * @type  boolean
 */
platform.isIphone  = (platform.isIos && !platform.isIpad);

/**
 * Converts a screen pixel to density-independent pixels.
 * 
 * @param    {int}  pixel   Screen pixels.
 * 
 * @returns  {int}  Converted value in dp. The value is rounded upward to it's nearest integer.
 */
platform.pixelToDp = function (pixel) {

    var dpi = Ti.Platform.displayCaps.dpi;
    var dp  = (pixel / dpi) * 160;
    dp      = Math.ceil(dp);
    
    return dp;
};

/**
 * Detects whether current device is a tablet.
 * 
 * @private
 */
function isTablet () {
    
    if (platform.isIpad) {
        
        return true;
    }
    
    var width  = Ti.Platform.displayCaps.platformWidth;
    var height = Ti.Platform.displayCaps.platformHeight;
    var min    = Math.min(width, height);

    if (550 > platform.pixelToDp(min)) {
        // not enough dp, we do not consider this as a tablet
        // the smallest size needs at least 200dp for masterview and 350dp for detailview
        
        return false;
    }
     
    var dpi = Ti.Platform.displayCaps.dpi;
    width   = width / dpi;
    height  = height / dpi;
    var screenSizeInch = Math.sqrt(width * width + height * height);
    
    return (screenSizeInch >= 6.0);
};

/**
 * True if the current device is considered to be a tablet. Currently, a device is considered to be a tablet if it is 
 * an iPad or if it is larger than 6 inch.
 *
 * @type  boolean
 */
platform.isTablet = isTablet();

/**
 * True if the current device is an Android and is a tablet, false otherwise.
 *
 * @type  boolean
 */
platform.isAndroidTablet = platform.isTablet && platform.isAndroid;

module.exports = platform;