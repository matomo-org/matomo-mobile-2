/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

// Override the platform-default User-Agent, which some WAF/anti-bot rules block on sight because
// it's prefixed with "Titanium SDK/...". See https://github.com/matomo-org/matomo-mobile-2/issues/5475
//
// - iOS: setting the global Ti.userAgent once here is enough. The native HTTP client uses it as
//   the base value and, as long as no per-request header is set afterwards, sends it unmodified.
// - Android: Ti.userAgent has no effect at all (TitaniumModule's userAgent getter is a distinct,
//   read-only, native-computed property that the HTTP client never consults), and the native
//   HTTPClient force-injects its own "Titanium SDK/..." header on every open() call, then only
//   ever appends (never replaces) any header set afterwards. HttpRequest.js works around this
//   per-request by clearing the header before re-setting it (see HttpRequest.prototype.send).
Alloy.Globals.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36';
Ti.userAgent = Alloy.Globals.userAgent;

Alloy.isTablet = require('Piwik/Platform').isTablet;
Alloy.isHandheld = !Alloy.isTablet;
Alloy.isIOS7OrLater = (7 <= parseInt(Ti.Platform.version, 10));
Alloy.Globals.isNotIpad = !(Alloy.isTablet);

Alloy.statusBarStyle = Ti.UI.iOS.StatusBar.DEFAULT;
