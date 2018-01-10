/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function PiwikApiError(error, message, platformErrorMessage)
{
    this.error   = error;
    this.message = message;
    this.platformErrorMessage = platformErrorMessage;
}

PiwikApiError.prototype.getError = function()
{
    return this.error + '';
};

PiwikApiError.prototype.getMessage = function()
{
    return this.message + '';
};

PiwikApiError.prototype.getPlatformErrorMessage = function()
{
    if (this.platformErrorMessage) {
        return this.platformErrorMessage + '';
    }

    return this.getMessage();
};

module.exports = PiwikApiError;