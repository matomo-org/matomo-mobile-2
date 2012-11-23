/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/** @private */
var Piwik  = require('library/Piwik');
/** @private */
var config = require('config');

/**
 * @class     Sends tracking requests to a piwik instance. The piwik instance can be configured within the config.
 *
 * @exports   TrackerRequest as Piwik.Network.TrackerRequest
 * @augments  Piwik.Network.HttpRequest
 */
function TrackerRequest () {

    this.baseUrl    = config.tracking.piwikServerUrl;
    
    this.sendErrors = false;
    
    this.userAgend  = Ti.userAgent;
}

/**
 * Extend Piwik.Network.HttpRequest.
 */
TrackerRequest.prototype = Piwik.require('Network/HttpRequest');

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
 * @see Piwik.Network.HttpRequest#error
 */
TrackerRequest.prototype.error = function () {
    this.cleanup();
};

/**
 * @see Piwik.Network.HttpRequest#load
 */
TrackerRequest.prototype.load = function () {
    this.cleanup();
};

module.exports = TrackerRequest;