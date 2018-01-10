/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var layoutName = '';
var alloy      = require('alloy');

if (OS_IOS && alloy.isHandheld) {
    layoutName = 'layout/ios/iphone';
} else if (OS_IOS && alloy.isTablet) {
    layoutName = 'layout/ios/ipad';
} else if (OS_MOBILEWEB && alloy.isTablet) {
    layoutName = 'layout/mobileweb/tablet';
} else if (OS_MOBILEWEB) {
    layoutName = 'layout/mobileweb/handheld';
} else if (OS_ANDROID && alloy.isTablet) {
    layoutName = 'layout/android/tablet';
} else if (OS_ANDROID) {
    layoutName = 'layout/android/handheld';
}

module.exports = require(layoutName);
