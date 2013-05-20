/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var rootWindow = Ti.UI.createWindow();

var AndroidLayout = require('layout/android');
var layout    = new (AndroidLayout)(rootWindow);

require('layout/window/recorder').apply(layout, []);
require('layout/sidebar/handheld').apply(layout, [rootWindow]);

exports = layout;