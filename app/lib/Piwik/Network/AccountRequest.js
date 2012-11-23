/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/** @private */
var Piwik  = require('library/Piwik');

/**
 * @class     Validates, verifies and saves given account information. Use this class if you want to add or update
 *            a new Piwik account.
 * 
 * @exports   AccountRequest as Piwik.Network.AccountRequest
 * @augments  Piwik.Network.Request
 *
 * @todo      maybe we should split latestVersion comparison from the account request. Maybe we should also do the
 *            latestVersion comparison more often, for example once per week/month
 * @todo      we should not directly save the account here, just verifying. Storing has nothing to do with 'request'.
 */
function AccountRequest () {
    
    /**
     * Fired if the given url is invalid
     *
     * @name   Piwik.Network.AccountRequest#event:onInvalidUrl
     * @event
     *
     * @param  {Object}  event
     * @param  {string}  event.type  The name of the event.
     * @param  {string}  event.url   The invalid url.
     */

    /**
     * Fired if the username is required but not given (if anonymous is disabled).
     *
     * @name   Piwik.Network.AccountRequest#event:onMissingUsername
     * @event
     *
     * @param  {Object}  event
     * @param  {string}  event.type  The name of the event.
     */

    /**
     * Fired if the password is required but not given (if anonymous is disabled).
     *
     * @name   Piwik.Network.AccountRequest#event:onMissingPassword
     * @event
     *
     * @param  {Object}  event
     * @param  {string}  event.type  The name of the event.
     */

    /**
     * Fired if the given account credentials are correct but the user has no view access to any site.
     *
     * @name   Piwik.Network.AccountRequest#event:onNoViewAccess
     * @event
     *
     * @param  {Object}   event
     * @param  {string}   event.type              The name of the event.
     * @param  {boolean}  event.errorMessageSent  true if the user was already informed about this error, false
     *                                            otherwise.
     */

    /**
     * Fired if there is any issue while fetching the tokenAuth or if the entered account credentials do not match.
     *
     * @name   Piwik.Network.AccountRequest#event:onReceiveAuthTokenError
     * @event
     *
     * @param  {Object}   event
     * @param  {string}   event.type              The name of the event.
     * @param  {boolean}  event.errorMessageSent  true if the user was already informed about this error, false
     *                                            otherwise.
     */

    /**
     * Fired if entered account credentials are correct and user has view access to at least one website.
     *
     * @name   Piwik.Network.AccountRequest#event:onload
     * @event
     *
     * @param  {Object}   event
     * @param  {string}   event.type     The name of the event.
     * @param  {string}   event.action   Either 'create' or 'update'. If value is 'create' we added a new
     *                                   account (on the mobile app, not on the server). If value is 'update'
     *                                   we updated an already existing account.
     * @param  {boolean}  event.success  true if update or create was successful, false otherwise.
     */

    /**
     * Holds the number of the latest available piwik version. For example '1.3.1'.
     *
     * @type string
     */
    this.latestVersion = null;

    /**
     * Holds the id of an account if the account already exists or if the creation of a new account was successful.
     *
     * @type string
     */
    this.accountId     = null;
    
    /**
     * Prefetching latest version number. Execute request in background and do not wait. We need this value later
     * as soon as the user presses the save button. we are fetching this already here to have a better performance
     * while requesting the users piwik version.
     */
    this.requestLatestVersion();
}

/**
 * Extend Piwik.Network.Request
 */
AccountRequest.prototype = Piwik.require('Network/Request');

/**
 * Validates the given account data. Fires an event if any account data is not valid, for example 'Missing
 * Username'. If the account data is valid, it fetches the tokenAuth which is needed to send Piwik API calls. It
 * uses the Piwik API method 'UsersManager.getTokenAuth' to verify the entered credentials. If we receive a valid
 * tokenAuth we do trigger the {@link Piwik.Network.AccountRequest#verifyAccess} method to verify whether the user has
 * at least view access.
 *
 * @param  {Object}   params
 * @param  {Object}   params.account            The account that shall be saved/requested
 * @param  {string}   [params.account.id]       The id of the account if the account already exists
 * @param  {string}   params.account.accessUrl  The url to the Piwik Server installation
 * @param  {boolean}  params.account.anonymous  True if anonymous mode is enabled, false otherwise
 * @param  {string}   params.account.username   The username, if anonymous is disabled
 * @param  {string}   params.account.password   The password, if anonymous is disabled
 * @param  {string}   params.account.name       A name that describes the account
 *
 * @fires  Piwik.Network.AccountRequest#event:onInvalidUrl
 * @fires  Piwik.Network.AccountRequest#event:onMissingUsername
 * @fires  Piwik.Network.AccountRequest#event:onMissingPassword
 * @fires  Piwik.Network.AccountRequest#event:onReceiveAuthTokenError
 * @fires  Piwik.Network.AccountRequest#event:onNoViewAccess
 * @fires  Piwik.Network.AccountRequest#event:onload
 */
AccountRequest.prototype.send = function (params) {

    var account        = params.account;

    this.accountId     = null;
    if (account && account.id) {
        this.accountId = account.id;
    }

    if (!account || !account.accessUrl || 'http' !== account.accessUrl.substr(0, 4).toLowerCase()) {

        this.fireEvent('onInvalidUrl', {type: 'onInvalidUrl', url: account.accessUrl});

        return;
    }

    if ((!account.username || '' == account.username) && !account.anonymous) {

        this.fireEvent('onMissingUsername', {type: 'onMissingUsername'});

        return;
    }

    if ((!account.password || '' == account.password) && !account.anonymous) {

        this.fireEvent('onMissingPassword', {type: 'onMissingPassword'});

        return;
    }
    
    // requests won't work if protocol is for example 'Http'
    account.accessUrl = 'http' + account.accessUrl.substr(4);
    
    var lastUrlChar   = account.accessUrl.substr(account.accessUrl.length - 1, 1);
    var last4UrlChars = account.accessUrl.substr(account.accessUrl.length -4, 4).toLowerCase();

    if ('/' !== lastUrlChar && '.php' !== last4UrlChars) {
        // append a slash if user entered an url like 'http://demo.piwik.org' . Do not append if user entered an url
        // like 'http://demo.piwik.org/index.php'
        account.accessUrl = account.accessUrl + '/';
    } 
    
    lastUrlChar = account.accessUrl.substr(account.accessUrl.length - 1, 1);
    
    if ('/' === lastUrlChar) {
        // if url doesn't end with *.php, append index.php automatically. we do not verify whether it ends with
        // index.php so the user is able to use for example xyz.php
        account.accessUrl = account.accessUrl + 'index.php';
    }

    if (account && account.anonymous) {

        account.tokenAuth = 'anonymous';
        
        return this.verifyAccess(account);
    }
    
    var credentials  = {userLogin:   account.username,
                        md5Password: Ti.Utils.md5HexDigest(account.password)};

    var piwikRequest = Piwik.require('Network/PiwikApiRequest');
    piwikRequest.setMethod('UsersManager.getTokenAuth');
    piwikRequest.setParameter(credentials);
    piwikRequest.setAccount(account);
    piwikRequest.setCallback(this, function (response) {

        if (!response || !Piwik.isObject(response) || !response.value) {

            var eventResult = {type: 'onReceiveAuthTokenError',
                               errorMessageSent: piwikRequest.errorMessageSent};

            this.fireEvent('onReceiveAuthTokenError', eventResult);

            return;
        }

        account.tokenAuth = response.value;

        return this.verifyAccess(account);
    });

    piwikRequest.send();
};

/**
 * Verify whether the account has at least view access using the method 'SitesManager.getSitesIdWithAtLeastViewAccess', 
 * see <a href="http://piwik.org/docs/analytics-api/reference/#SitesManager">SitesManager</a>.
 * Fires an event if the user if the user has not at least view access. Triggers also a version comparison
 * whether the Piwik Server version is outdated or not. If the user has at least view access, it updates or creates
 * the account.
 *
 * @param  {Object}  account
 *
 * @fires  Piwik.Network.AccountRequest#event:onNoViewAccess
 * @fires  Piwik.Network.AccountRequest#event:onload
 */
AccountRequest.prototype.verifyAccess = function (account) {

    if (!this.accountId) {
        // account doesn't already exist. we have to create the account and activate the account by default
        account.active = 1;
    }
    
    this.requestVersion();

    var piwikRequest = Piwik.require('Network/PiwikApiRequest');
    piwikRequest.setMethod('SitesManager.getSitesWithAtLeastViewAccess');
    piwikRequest.setParameter({limit: 1});
    piwikRequest.setAccount(account);
    piwikRequest.setCallback(this, function (response) {
        var eventResult = null;

        if (!response || !Piwik.isArray(response) || 0 == response.length) {

            eventResult = {errorMessageSent: piwikRequest.errorMessageSent,
                           type: 'onNoViewAccess'};

            this.fireEvent('onNoViewAccess', eventResult);

            return;
        }

        var success = false;
        var action  = 'create';

        var accountManager = Piwik.require('App/Accounts');

        if (this.accountId) {
            
            action         = 'update';
            success        = accountManager.updateAccount(this.accountId, account);
            account        = accountManager.resetPiwikVersion(account);
            accountManager.updatePiwikVersion(account);
        } else {
            this.accountId = accountManager.createAccount(account);
            success        = Boolean(this.accountId);
        }

        eventResult = {type: 'onload',
                       success: success,
                       action: action};

        this.fireEvent('onload', eventResult);
    });

    piwikRequest.send();
};

/**
 * Requests the version number of the user's piwik installation and compares it with the latest version
 * number. Informs the user if there is a newer version available. It does not always work. It is possible
 * that eg. the user has deactivated ExampleApi. Another possible reason is that the request to fetch the
 * latest version number (@link Piwik.Network.AccountRequest#requestLatestVersion) is still running
 * while this request is already finished. We could wait in such a case but we prefer a simpler version at the
 * moment.
 *
 * To compare both version numbers we create an integer for each version. For example Version '1.4.0' is 140.
 * Version '0.7.0' would be interpreted as 70.
 *
 * @todo  we should fire an event about version mismatch... instead of directly displaying a message
 */
AccountRequest.prototype.requestVersion = function () {

    var that           = this;
    
    var accountManager = Piwik.require('App/Accounts');
    var account        = accountManager.getAccountById(this.accountId);

    var piwikRequest   = Piwik.require('Network/PiwikApiRequest');
    piwikRequest.setMethod('API.getPiwikVersion');
    piwikRequest.setAccount(account);
    piwikRequest.setCallback(this, function (response) {

        if (!response) {

            return;
        }

        if (response && response.result && 'error' == response.result) {
            // in most cases the ExampleApi is deactivated or token_auth is not valid

            Piwik.getLog().debug('Compare Version error, message: ' + response.message,
                            'Piwik.Network.AccountRequest::requestVersion');

            return;
        }

        if (!that.latestVersion) {
            // we define a default value if we are not able to fetch the latest available version.

            var config         = require('config');
            that.latestVersion = config.piwik.latestServerVersion;
        }

        if (!response || !response.value) {
            
            return;
        }

        if (response.value) {
            var serverVersionEvent = {url:   '/piwik/server-version/' + response.value, 
                                      title: 'Piwik Server Version'};
            Piwik.getTracker().trackEvent(serverVersionEvent);
        } 
        
        var stringUtils   = Piwik.require('Utils/String');
        var version       = stringUtils.toPiwikVersion(response.value);
        var latestVersion = stringUtils.toPiwikVersion(that.latestVersion);
        stringUtils       = null;

        if (version && latestVersion && latestVersion > version) {
            Piwik.getLog().debug('Version is out of date: ' + version,
                            'Piwik.Network.AccountRequest::requestVersion#version');

            var _           = require('library/underscore');
            var alertDialog = Ti.UI.createAlertDialog({
                title: _('General_PleaseUpdatePiwik'),
                message: String.format(_('General_PiwikXIsAvailablePleaseNotifyPiwikAdmin'), '' + that.latestVersion),
                buttonNames: [_('General_Ok')]
            });

            alertDialog.show();
        }
    });

    /**
     * disable the display of error messages in this case. The worst case will be the user does not get informed
     * if the latest version isn't installed.
     * @ignore
     */
    piwikRequest.sendErrors = false;

    piwikRequest.send();
};

/**
 * Requests the latest version number of piwik. This value is needed to be able to compare it with the version
 * number of the user's piwik installation.
 */
AccountRequest.prototype.requestLatestVersion = function () {

    var that    = this;

    var request = Piwik.require('Network/HttpRequest');

    /**
     * disable the display of error messages in this case. the worst case will be the user does not get informed
     * if the latest version isn't installed
     * @ignore
     */
    request.sendErrors = false;

    request.setBaseUrl('http://api.piwik.org/1.0/getLatestVersion/');
    request.setParameter({trigger: 'MobileClient-' + Ti.Platform.osname,
                          mobile_version: Ti.Platform.version});

    request.setCallback(this, function (response) {

        if (!response) {
            return;
        }

        that.latestVersion = response;
    });
    
    request.handle();
};

module.exports = AccountRequest;