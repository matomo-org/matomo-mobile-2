/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

Alloy.isTablet = require('Piwik/Platform').isTablet;
Alloy.isHandheld = !Alloy.isTablet;
Alloy.isIOS7OrLater = OS_IOS && (7 <= parseInt(Ti.Platform.version, 10));
Alloy.Globals.isNotIpad = !(OS_IOS && Alloy.isTablet);

if (OS_IOS) {
    Alloy.statusBarStyle = Ti.UI.iOS.StatusBar.LIGHT_CONTENT;
} else {
    Alloy.statusBarStyle = null;
}
