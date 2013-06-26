/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function PiwikApiError(error, message)
{
    this.error   = error;
    this.message = message;
}

PiwikApiError.prototype.getError = function()
{
    return this.error + '';
};

PiwikApiError.prototype.getMessage = function()
{
    return this.message + '';
};

module.exports = PiwikApiError;