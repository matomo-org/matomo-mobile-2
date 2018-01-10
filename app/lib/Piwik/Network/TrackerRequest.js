/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

/**
 * Matomo - Web Analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/**
 * @class     Sends tracking requests to a piwik instance. The piwik instance can be configured within the config.
 *
 * @augments  HttpRequest
 */
function TrackerRequest () {

    this.baseUrl    = require('alloy').CFG.tracking.piwikServerUrl;

    this.userAgent  = Ti.userAgent;
}

var HttpRequest = require('Piwik/Network/HttpRequest');

/**
 * Extend HttpRequest.
 */
TrackerRequest.prototype = new HttpRequest();

/**
 * Sends the tracking request.
 */
TrackerRequest.prototype.send = function () {

    if (!this.parameter) {
        this.parameter = {};
    }

    this.handle();
};

/**
 * @see HttpRequest#error
 */
TrackerRequest.prototype.error = function () {
    this.cleanup();
};

/**
 * @see HttpRequest#load
 */
TrackerRequest.prototype.load = function () {
    this.cleanup();
};

module.exports = TrackerRequest;
