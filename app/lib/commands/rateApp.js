/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

exports.execute = function ()
{
    var appRating = new (require('Piwik/App/Rating'));
    appRating.rate();
}