/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/** @private */
var Piwik = require('library/Piwik');

/**
 * @class     Provides the ability to make an authenticated call using the piwik rest api. The data are requested
 *            via HTTP GET method. 
 *
 * @example
 * var request = Piwik.require('Network/PiwikApiRequest');
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
     * @see      <a href="http://dev.piwik.org/trac/wiki/API/Reference#Standardparameters">Piwik Api Reference</a>
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
    this.method        = null;

    /**
     * The piwik account that will be used to execute the request. The account contains the piwik accessUrl as well
     * as the authToken.
     *
     * @see   Piwik.App.Accounts
     *
     * @type  Object|null
     */
    this.account       = null;
    
    /**
     * The handleAs parameter specifies how to parse the received data.
     *
     * @see      Piwik.Network.HttpRequest#handleAs
     * 
     * @default  "text"
     *
     * @type     string
     *
     * @override
     */
    this.handleAs      = 'json';
}

/**
 * Extend Piwik.Network.HttpRequest.
 */
PiwikApiRequest.prototype = Piwik.require('Network/HttpRequest');

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
 * @see    Piwik.Network.PiwikApiRequest#method
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
 * @see    Piwik.Network.PiwikApiRequest#account
 *
 * @param  {Object}  account
 */
PiwikApiRequest.prototype.setAccount = function (account) {
    this.account = account;
    account      = null;
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

    var settings = Piwik.require('App/Settings');
    var language = settings.getLanguage();
    settings     = null;
    
    if (language) {
        parameter.language   = language;
    }
    
    return parameter;
};

/**
 * Verifies the response.
 * 
 * @see      Piwik.Network.HttpRequest#isValidResponse
 * 
 * @param    {Object|null}  The received response.
 * 
 * @returns  {boolean}      true if the response is valid, false otherwise.
 *
 * @override
 */
PiwikApiRequest.prototype.isValidResponse = function (response) {
    
    if (response && Piwik.isObject(response) && response.result && 'error' == response.result) {
        // the piwik response contains an error
        
        if (!this.displayErrorAllowed()) {
            // verify whether we are authorized to display an error message
            response = null;
            
            return false;
        }
        
        this.errorMessageSent = true;

        var _       = require('library/underscore');
        
        var message = _('General_InvalidResponse');
        if (response.message) {
            message = response.message;
        }

        var alertDialog = Ti.UI.createAlertDialog({
            title: _('General_Error'),
            message: message,
            buttonNames: [_('General_Ok')]
        });

        alertDialog.show();
        response = null;
        
        return false;
    }
    
    response = null;
    
    return true;
};

/**
 * Sends the request to the piwik api (async).
 */
PiwikApiRequest.prototype.send = function () {

    if (!this.parameter) {
        this.parameter = {};
    }
    
    if (this.account && this.account.tokenAuth) {
        this.setUserAuthToken(this.account.tokenAuth);
    }
    
    if (this.account && this.account.accessUrl) {
        this.setBaseUrl(this.account.accessUrl);
    }

    this.parameter     = this._mixinParameter(this.parameter);
    
    this.handle();
};

module.exports = PiwikApiRequest;