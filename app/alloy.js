/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

Alloy.isTablet = require('Piwik/Platform').isTablet;
Alloy.isHandheld = !Alloy.isTablet;

if ('test' === Ti.App.deployType && OS_IOS) {

    require('behave/loader').loadSuits();
    require('behave').run(this);
}