/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function PiwikApiError(error, message, platformErrorMessage, httpStatusCode)
{
    this.error   = error;
    this.message = message;
    this.platformErrorMessage = platformErrorMessage;
    this.httpStatusCode = httpStatusCode;
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

PiwikApiError.prototype.getHttpStatusCode = function()
{
    return this.httpStatusCode;
};

module.exports = PiwikApiError;