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
 * @class     Provides the ability to make an authenticated call using the piwik rest api. The data are requested
 *            via HTTP GET method. 
 *
 * @example
 * var request = require('Piwik/Network/PiwikApiRequest');
 * request.setMethod('UsersManager.getTokenAuth');
 * request.setParameter({idSite: 4});
 * request.setAccount(account);
 * request.setCallback(this, function (response) {});
 * 
 * @exports   PiwikApiRequest as Piwik.Network.PiwikApiRequest
 * @augments  Piwik.Network.HttpRequest
 */
function PiwikApiRequest () {

    /**
     * Defines the format of the output when fetching data from the piwik rest api.
     * 
     * @see      <a href="http://dev.matomo.org/trac/wiki/API/Reference#Standardparameters">Piwik Api Reference</a>
     *
     * @default  "json"
     * @type     string
     *
     * @override
     */
    this.format        = 'json';

    /**
     * Defines the period you request the statistics for.
     * 
     * @see      <a href="http://dev.piwik.org/trac/wiki/API/Reference#Standardparameters">Piwik Api Reference</a>
     *
     * @default  "day"
     * @type     string
     */
    this.period        = 'day';
    
    /**
     * The needed token to make an authenticated call.
     * 
     * @see      <a href="http://dev.piwik.org/trac/wiki/API/Reference#Makeanauthenticatedcall">Piwik Api Reference</a>
     * @default  "anonymous"
     * 
     * @type     string|null
     */
    this.userAuthToken = 'anonymous';

    /**
     * The name of the piwik api method that will be used.
     *
     * @type  string|null
     */
    this.method = null;

    /**
     * The piwik account that will be used to execute the request. The account contains the piwik accessUrl as well
     * as the authToken.
     *
     * @see appAccounts
     *
     * @type  Object|null
     */
    this.account = null;

    /**
     * A piwik segment definition.
     *
     * @type string|null
     */
    this.segment = null;
}

var HttpRequest = require('Piwik/Network/HttpRequest');

/**
 * Extend HttpRequest.
 */
PiwikApiRequest.prototype = new HttpRequest();

/**
 * Sets (overwrites) the user auth token.
 *
 * @param  {string}  token
 *
 * @type   null
 */
PiwikApiRequest.prototype.setUserAuthToken = function (token) {

    // override default token only if token is a string and has at least 5 chacters.
    if (token && 'string' === (typeof token).toLowerCase() && 4 < token.length) {
        this.userAuthToken = token;
    } else {
        this.userAuthToken = 'anonymous';
    }
};

/**
 * Sets (overwrites) the used piwik api method.
 *
 * @see    PiwikApiRequest#method
 *
 * @param  {string}  method
 */
PiwikApiRequest.prototype.setMethod = function (method) {
    this.method = method;
    method      = null;
};

/**
 * Sets (overwrites) the used account.
 *
 * @see    PiwikApiRequest#account
 *
 * @param  {Object}  account
 */
PiwikApiRequest.prototype.setAccount = function (account) {
    this.account = account;
    account      = null;
};

/**
 * Sets (overwrites) the used account.
 *
 * @see    PiwikApiRequest#account
 *
 * @param  {Object}  account
 */
PiwikApiRequest.prototype.setSegment = function (segment) {
    this.segment = segment;
};

/**
 * Mixins all required parameters to make a call to the piwik api. Sets default values for not set parameters and
 * adds some further parameters.
 *
 * @param  {Object}  parameter  The given parameters in this style: Object ( [key] => <value> )
 *
 * @type   null
 * 
 * @private
 */
PiwikApiRequest.prototype._mixinParameter = function (parameter) {
    
    if (!parameter) {
        parameter = {};
    }

    if (!parameter.module) {
        parameter.module     = 'API';
    }

    if (!parameter.date) {
        parameter.date       = 'today';
    }

    if (this.userAuthToken) {
        parameter.token_auth = this.userAuthToken;
    }

    if (!parameter.period) {
        parameter.period     = this.period;
    }

    if (!parameter.format) {
        parameter.format     = this.format;
    }

    if (!parameter.method) {
        parameter.method     = this.method;
    }

    if (!parameter.segment && this.segment) {
        parameter.segment    = this.segment;
    }

    var settings = Alloy.createCollection('AppSettings').settings();
    var language = settings.languageCode();
    settings     = null;
    
    if (language) {
        parameter.language = language;
    }
    
    return parameter;
};

/**
 * Verifies the response.
 * 
 * @see      HttpRequest#isValidResponse
 * 
 * @param    {Object|null}  The received response.
 * 
 * @returns  {string|null}  An error message if response is invalid, null otherwise.
 *
 * @override
 */
PiwikApiRequest.prototype.getErrorIfInvalidResponse = function (response) {
    var _ = require('alloy/underscore')._;
    
    if (response && _.isObject(response) && response.result && 'error' == response.result) {
        // the piwik response contains an error

        return response.message + '';
    }
    
    response = null;
    
    return null;
};

PiwikApiRequest.prototype.getUrl = function () {

    var buildEncodedUrlQuery = require('url').buildEncodedUrlQuery;
    var parameter = this._mixinParameter(this.parameter || {});

    return this.baseUrl + buildEncodedUrlQuery(parameter);
};

/**
 * Sends the request to the piwik api (async).
 */
PiwikApiRequest.prototype.send = function () {

    if (!this.parameter) {
        this.parameter = {};
    }

    this.parameter = this._mixinParameter(this.parameter);
    
    this.handle();
};

module.exports = PiwikApiRequest;
