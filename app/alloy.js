/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

Alloy.isTablet = require('Piwik/Platform').isTablet;
Alloy.isHandheld = !Alloy.isTablet;

if ('test' == Ti.App.deployType) {

    // TODO iterate over all existing files and include them dynamically
    require('specs/models/baseCache_spec');

    require('behave').run(this);
}