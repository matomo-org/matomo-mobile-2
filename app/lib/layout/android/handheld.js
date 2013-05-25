/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var AndroidLayout = require('layout/android');
var layout = new (AndroidLayout)();

require('layout/window/recorder').apply(layout, []);
require('layout/android/sidebar/handheld').apply(layout, []);

module.exports = layout;