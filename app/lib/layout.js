/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var layoutName = '';
var alloy      = require('alloy');

if (alloy.isTablet) {
    layoutName = 'layout/android/tablet';
} else  {
    layoutName = 'layout/android/handheld';
}

module.exports = require(layoutName);
