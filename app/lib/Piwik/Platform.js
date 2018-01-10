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

function isIpad()
{
    var osName = ('' + Ti.Platform.osname).toLowerCase();
    var isIpad = ('ipad' === osName);

    return isIpad;
}

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
}

function dpToPixel(dp) {
    var factor = Ti.Platform.displayCaps.getLogicalDensityFactor();

    if (factor) {
        return Math.ceil(dp * factor);
    }

    // fallback
    var dpi = Ti.Platform.displayCaps.dpi;

    if (dpi > 160) {
        var px = dp * (dpi / 160);
        px = Math.ceil(px);

        return px;
    }

    // another fallback
    return Math.ceil(dp);
}

function getScreenSizeInInch()
{
    var width  = Ti.Platform.displayCaps.platformWidth;
    var height = Ti.Platform.displayCaps.platformHeight;

    var dpi = Ti.Platform.displayCaps.dpi;
    width   = width / dpi;
    height  = height / dpi;
    var screenSizeInch = Math.sqrt(width * width + height * height);

    return screenSizeInch;
}

function isWideEnoughToConsiderItAsATablet(width)
{
    if (550 > width) {
        // the smallest size needs at least 250dp for masterview and 300dp for detailview
        return false;
    }

    return true;
}

/**
 * Detects whether current device is a tablet.
 * 
 * @private
 */
function isTablet () {
    
    if (isIpad()) {
        
        return true;
    }

    var width  = Ti.Platform.displayCaps.platformWidth;
    var height = Ti.Platform.displayCaps.platformHeight;
    var min    = Math.min(width, height);

    if (OS_MOBILEWEB && isWideEnoughToConsiderItAsATablet(min)) {
        return true;

    } else if (OS_MOBILEWEB) {

        return false;
    }

    // android
    var widthInDp = pixelToDp(min);
    if (!isWideEnoughToConsiderItAsATablet(widthInDp)) {
        
        return false;
    }
     
    var screenSizeInch = getScreenSizeInInch();
    
    return (screenSizeInch >= 6.0);
}

function isRetinaHDDisplay()
{
    var dpi = Ti.Platform.displayCaps.dpi;
    
    return 480 <= parseInt(dpi, 10);
}

function getIOSScaleFactor()
{
    if (isRetinaHDDisplay()) {
        return 3;
    }
    return 2;
}

/**
 * True if the current device is considered to be a tablet. Currently, a device is considered to be a tablet if it is 
 * an iPad or if it is larger than 6 inch.
 *
 * @type  boolean
 */
module.exports.isTablet = isTablet();
module.exports.getIOSScaleFactor = getIOSScaleFactor;
module.exports.dpToPixel = dpToPixel;