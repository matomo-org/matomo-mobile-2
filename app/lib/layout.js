/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var layoutName = '';
var alloy      = require('alloy');

if (alloy.isHandheld) {
    layoutName = 'layout/ios/iphone';
} else if (alloy.isTablet) {
    layoutName = 'layout/ios/ipad';
}

module.exports = require(layoutName);
