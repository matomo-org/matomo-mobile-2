/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var rootWindow = Ti.UI.createWindow();

var MobileWebLayout = require('layout/mobileweb');
var layout = new (MobileWebLayout)(rootWindow);

require('layout/window/recorder').apply(layout, []);
require('layout/sidebar/tablet').apply(layout, [rootWindow]);

exports = layout;
