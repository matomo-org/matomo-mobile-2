/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

var osName = ('' + Ti.Platform.osname).toLowerCase();

/**
 * True if the current device is an iPad, false otherwise.
 *
 * @type  boolean
 */
var isIpad    = ('ipad' === osName);

/**
 * Converts a screen pixel to density-independent pixels.
 * 
 * @param    {int}  pixel   Screen pixels.
 * 
 * @returns  {int}  Converted value in dp. The value is rounded upward to it's nearest integer.
 */
function pixelToDp(pixel) {

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
    
    if (isIpad) {
        
        return true;
    }

    var width  = Ti.Platform.displayCaps.platformWidth;
    var height = Ti.Platform.displayCaps.platformHeight;
    var min    = Math.min(width, height);

    if (OS_MOBILEWEB && 550 > min) {
        // we need at least 550 pixels
        return false;

    } else if (OS_MOBILEWEB) {

        return true;
    }

    // android
    if (550 > pixelToDp(min)) {
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
module.exports.isTablet = isTablet();
