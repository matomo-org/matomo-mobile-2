/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

exports.execute = function (link)
{
    if (!link) {
        
        return;
    }
    
    try {
        var tracker = require('Piwik/Tracker');
        tracker.trackLink(link, 'link');
        Ti.Platform.openURL(link);
    } catch (e) {
        
        console.warn('Failed to open url: ' + url + ': ' + e.message, 'OpenLinkCommand::execute');
    }
};