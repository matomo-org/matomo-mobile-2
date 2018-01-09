/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

exports.execute = function () 
{
    var L = require('L');

    var link = '';
    if (OS_IOS) {
        link = 'http://ios.piwik.org#faqs';
    } else {
        link = 'https://matomo.org/faq/mobile-app/';
    }
    
    require('commands/openLink').execute(link);
};