/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

Alloy.isTablet = require('Piwik/Platform').isTablet;
Alloy.isHandheld = !Alloy.isTablet;
Alloy.isIOS7OrLater = OS_IOS && (7 <= parseInt(Ti.Platform.version, 10));

if (OS_IOS) {
    Alloy.statusBarStyle = Ti.UI.iPhone.StatusBar.LIGHT_CONTENT;
} else {
    Alloy.statusBarStyle = null;
}
