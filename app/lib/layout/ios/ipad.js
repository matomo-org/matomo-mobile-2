/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var rootWindow = Ti.UI.createNavigationWindow({statusBarStyle: Alloy.statusBarStyle});

var iOSLayout = require('layout/ios');
var layout    = new (iOSLayout)(rootWindow);

require('layout/window/recorder').apply(layout, []);
require('layout/sidebar/tablet').apply(layout, [rootWindow]);

module.exports = layout;
