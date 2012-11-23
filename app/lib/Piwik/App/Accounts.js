/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/** @private */
var Piwik   = require('Piwik');

/** @private */
var storage = require('Piwik/App/Storage');

/**
 * @class   Provides the ability to manage multiple user accounts of multiple piwik server installations. Each created
 *          account will be stored beyond application sessions. We store all account information in our application
 *          store (Ti.App.Properties).
 *
 *          The structure is as follows:
 *          A list/array of all available account ids is stored within the key 'accounts_available'.
 *
 *          Each account containing information like credentials and url is stored within the key 'account_{accountid}'.
 *
 *          An accountId is a hash, not an integer.
 *
 *          To get a list of all available accounts we have to fetch the account ids from the accounts_available store
 *          entry. Afterwards we can fetch each single account depending on the accountId. Each time we add or remove
 *          an account, we have to update the accounts_available list.
 * 
 * @exports Accounts as Piwik.App.Accounts
 *
 * @todo    add caching via app.session
 */
function Accounts () {

    /**
     * These are the mandatory properties in order to add a new account. Adding an account without specified each
     * of these properties will not work. These properties can also be updated.
     * 
     * @type  Array
     *
     * Array (
     *     [accessUrl] => [{string} The access URL to the piwik server. Value should start with 'https://' to do an encrypted request, 'http' otherwise]
     *     [username]  => [{string} The userLogin of a piwik user. {@link http://dev.piwik.org/trac/wiki/API/Reference#UsersManager}]
     *     [tokenAuth] => [{string} The token_auth which identifies the user in rest API calls {@link http://dev.piwik.org/trac/wiki/API/Reference#Makeanauthenticatedcall}]
     * )
     */
    this.mandatoryFields = ['accessUrl', 'username', 'tokenAuth']; 

    /**
     * These are optional properties in order to add a new account or update an existing account.
     * id, createVersionNumber and changeVersionNumber will be set automatically. 
     * 
     * @type  Array
     *
     * Array (
     *     [id]                   => [{string} An unique id/hash which identifies the account. Will be generated automatically]
     *     [name]                 => [{string} The name of the account. User can specify any name. Intended only for visual purposes so that the user can identify the account]
     *     [active]               => [{int}    0 if the account is inactive, 1 otherwise. Do not request statistics of an inactive account]
     *     [createVersionNumber]  => [{string} The current version number of the app when the account was created. Will be set automatically]
     *     [changeVersionNumber]  => [{string} The current version number of the app when the account was changed at last. Will be set automatically]
     *     [version]              => [{int}    The Piwik Core Server version, eg. 183, 151, 160, 80]
     *     [dateVersionUpdated]   => [{string} Stores the date/time when the Piwik server version was updated. For example 'Sun Sep 02 2012 20:01:02 GMT+0200 (CEST)']
     * )
     */
    this.optionalFields  = ['id', 'name', 'active', 'createVersionNumber', 'changeVersionNumber', 'version',
                            'dateVersionUpdated'];
}

/**
 * Returns all available accounts, even inactive ones. Returns an empty array if no account exists.
 *
 * @returns  {Array}  An array containing multiple accounts in the following format:
 *   Array (
 *       [int] => Object (
 *                   [id]                   => [See {@link Piwik.App.Accounts#optionalFields}]
 *                   [name]                 => [See {@link Piwik.App.Accounts#optionalFields}]
 *                   [active]               => [See {@link Piwik.App.Accounts#optionalFields}]
 *                   [createVersionNumber]  => [See {@link Piwik.App.Accounts#optionalFields}]
 *                   [changeVersionNumber]  => [See {@link Piwik.App.Accounts#optionalFields}]
 *                   [version]              => [See {@link Piwik.App.Accounts#optionalFields}]
 *                   [dateVersionUpdated]   => [See {@link Piwik.App.Accounts#optionalFields}]
 *                   [accessUrl]            => [See {@link Piwik.App.Accounts#mandatoryFields}]
 *                   [username]             => [See {@link Piwik.App.Accounts#mandatoryFields}]
 *                   [tokenAuth]            => [See {@link Piwik.App.Accounts#mandatoryFields}]
 *               )
 *   )
 */
Accounts.prototype.getAccounts = function () {

    var accountIds  = storage.get('accounts_available');

    if (!accountIds || storage.KEY_NOT_FOUND == accountIds || 0 === accountIds.length) {
        
        return [];
    }
    
    var accounts      = [];
    var newAccountIds = [];
    
    for (var index  = 0; index < accountIds.length; index++) {
        var account = this.getAccountById(accountIds[index]);
        
        if (!account || !account.id || storage.KEY_NOT_FOUND == account) {

            continue;
        }
    
        accounts.push(account);
        newAccountIds.push(account.id);
        account = null;
    }
    
    if (accounts.length < accountIds.length && accounts.length == newAccountIds.length) {
        // at least one account was removed.
        storage.set('accounts_available', newAccountIds);
    }
    
    accountIds  = null;

    return accounts;
};

/**
 * Returns the number of configured active. Counts inactive as well as active accounts.
 *
 * @type  number
 */
Accounts.prototype.getNumAccounts = function () {

    var accounts = this.getAccounts();

    if (accounts && accounts.length) {

        return accounts.length;
    }

    return 0;
};

/**
 * Verifies whether the user has already defined at least one active account.
 *
 * @returns  {boolean}  true if the user already has an active account, false otherwise.
 */
Accounts.prototype.hasActivedAccount = function () {
    
    var accountIds = storage.get('accounts_available');
    
    if (!accountIds || storage.KEY_NOT_FOUND == accountIds || 0 === accountIds.length) {
    
        return false;
    }
    
    var accounts   = [];
    
    for (var index = 0; index < accountIds.length; index++) {
        var accountId = accountIds[index];
        var account   = this.getAccountById(accountId);
        
        if (account && storage.KEY_NOT_FOUND !== account && Boolean(account.active)) {
            
            return true;
        }
    }

    return false;
};

/**
 * Fetches an already existing account by the given account id. 
 *
 * @param    {int}  id      The unique id of the account you want to retrieve.
 *
 * @returns  {Object|void}  null if the account does not exist. An object containing the account information otherwise.
 *   Object (
 *       [id]                   => [See {@link Piwik.App.Accounts#optionalFields}]
 *       [name]                 => [See {@link Piwik.App.Accounts#optionalFields}]
 *       [active]               => [See {@link Piwik.App.Accounts#optionalFields}]
 *       [createVersionNumber]  => [See {@link Piwik.App.Accounts#optionalFields}]
 *       [changeVersionNumber]  => [See {@link Piwik.App.Accounts#optionalFields}]
 *       [version]              => [See {@link Piwik.App.Accounts#optionalFields}]
 *       [dateVersionUpdated]   => [See {@link Piwik.App.Accounts#optionalFields}]
 *       [accessUrl]            => [See {@link Piwik.App.Accounts#mandatoryFields}]
 *       [username]             => [See {@link Piwik.App.Accounts#mandatoryFields}]
 *       [tokenAuth]            => [See {@link Piwik.App.Accounts#mandatoryFields}]
 *   )
 */
Accounts.prototype.getAccountById = function (id) {

    if (!id) {
    
        return;
    }
    
    var account = storage.get('account_' + id);
       
    if (!account || storage.KEY_NOT_FOUND == account) {
        
        return;
    }
    
    return account;
};

/**
 * Creates a new account.
 *
 * @param    {Object}  account
 * @param    {string}  account.accessUrl   See {@link Piwik.App.Accounts#mandatoryFields}
 * @param    {string}  account.username    See {@link Piwik.App.Accounts#mandatoryFields}
 * @param    {string}  account.tokenAuth   See {@link Piwik.App.Accounts#mandatoryFields}
 * @param    {string}  [account.name]      Optional, see {@link Piwik.App.Accounts#optionalFields}
 * @param    {int}     [account.active=1]  Optional, see {@link Piwik.App.Accounts#optionalFields}
 *
 * @returns  {string|void}  null if an error occurred. For example if not all mandatory properties are specified.
 *                          The id/hash of the created account otherwise.
 */
Accounts.prototype.createAccount = function (account) {
     
    if (!account || !Piwik.isObject(account)) {
    
        return;
    }

    var values = {};

    // we need the create/changeVersionNumber for possible migrations in the future.
    values.id                  = Ti.Platform.createUUID();
    values.createVersionNumber = Ti.App.version;
    values.changeVersionNumber = null;

    if ('undefined' === (typeof account.active) || null === account.active) {
        values.active = 1;
    }

    var fieldName;

    // verify whether all mandatory fields are given
    for (var index = 0; index < this.mandatoryFields.length; index++) {
        fieldName  = this.mandatoryFields[index];
        
        if ('undefined' === (typeof account[fieldName])) {
            // @todo throw an error here?

            return;
        }
        
        values[fieldName] = account[fieldName];
    }

    // set all not given optional fields to null
    for (index = 0; index < this.optionalFields.length; index++) {
        fieldName = this.optionalFields[index];

        if ('undefined' === (typeof account[fieldName])) {
            
            if ('undefined' === (typeof values[fieldName])) {
                values[fieldName] = null;
            }
            
            continue;
        }
        
        values[fieldName] = account[fieldName];
    }

    // store account information in application store
    storage.set('account_' + values.id, values);

    // add the created account (id) to the list of all available accounts. 
    var accountIds = storage.get('accounts_available');

    if (!accountIds || storage.KEY_NOT_FOUND == accountIds || 0 == accountIds.length) {
        accountIds = [];
    }

    accountIds.push(values.id);

    storage.set('accounts_available', accountIds);
    
    return values.id;
};

/**
 * Updates the values of an already existing account. Changes only specified properties.
 *
 * @param    {string}   id                   The id of the account you want to update
 * @param    {Object}   account
 * @param    {string}   [account.accessUrl]  Optional, see {@link Piwik.App.Accounts#mandatoryFields}
 * @param    {string}   [account.username]   Optional, see {@link Piwik.App.Accounts#mandatoryFields}
 * @param    {string}   [account.tokenAuth]  Optional, see {@link Piwik.App.Accounts#mandatoryFields}
 * @param    {string}   [account.name]       Optional, see {@link Piwik.App.Accounts#optionalFields}
 * @param    {int}      [account.active]     Optional, see {@link Piwik.App.Accounts#optionalFields}
 * @param    {int}      [account.version]    Optional, see {@link Piwik.App.Accounts#optionalFields}
 * @param    {string}   [account.dateVersionUpdated]  Optional, see {@link Piwik.App.Accounts#optionalFields}
 *
 * @returns  {boolean}  true on success, false otherwise.
 */
Accounts.prototype.updateAccount = function (id, account) {
    
    if (!id || !account || !Piwik.isObject(account)) {
    
        return false;
    }
    
    var values = this.getAccountById(id);
    
    if (!values) {
        
        return false;
    }
    
    values.changeVersionNumber = Ti.App.version;

    var allowedFields          = this.mandatoryFields.concat(this.optionalFields);
    var fieldName;

    // change only given fields
    for (var index = 0; index < allowedFields.length; index++) {
        fieldName  = allowedFields[index];
        
        if ('undefined' !== (typeof account[fieldName])) {
            
            values[fieldName] = account[fieldName];
        }
    }
    
    storage.set('account_' + values.id, values);
    
    return true;
};

/**
 * Deletes an existing account (forever).
 *
 * @param    {string}      id  The id of the account you want to delete.
 *
 * @returns  {null|false}  false if id is empty, null otherwise.
 */
Accounts.prototype.deleteAccount = function (id) {
    if (!id) {
    
        return false;
    }
    
    storage.remove('account_' + id);
};

/**
 * Activates an existing account.
 *
 * @param    {string}  id  The id of the account you want to activate.
 *
 * @returns  {boolean}     true on success, false otherwise.
 */
Accounts.prototype.activateAccount = function (id) {
    
    return this.updateAccount(id, {active: 1});
};

/**
 * Deactivates an existing account.
 *
 * @param    {string}  id  The id of the account you want to deactivate.
 *
 * @returns  {boolean}     true on success, false otherwise.
 */
Accounts.prototype.deactivateAccount = function (id) {
    
    return this.updateAccount(id, {active: 0});
};

/**
 * Resets all information about the Piwik version.
 * 
 * @param    {Object}  account  A piwik account. See {@link Piwik.App.Accounts}
 * 
 * @returns  {Object}  The updated piwik account
 */
Accounts.prototype.resetPiwikVersion = function(account) {
    
    if (!account) {
        
        return account;
    }
    
    account.version            = 0;
    account.dateVersionUpdated = null;
    
    return account;
};

/**
 * Requests the current Piwik core version and updates the account. The Piwik server version will be requested max once
 * per day.
 * 
 * @param  {Object}  account  A piwik account. See {@link Piwik.App.Accounts}
 */
Accounts.prototype.updatePiwikVersion = function(account) {
    
    if (!account) {
        
        return;
    }
    
    if (!account.dateVersionUpdated) {
        // version not updated yet. Set it to null. new Date(null) will be Jan 01 1970 and therefore force an update
        account.dateVersionUpdated = null;
    }

    var dateNow             = (new Date()).toDateString();
    var lastUpdatedDate     = new Date(account.dateVersionUpdated);
    var alreadyUpdatedToday = dateNow == lastUpdatedDate.toDateString();

    if (alreadyUpdatedToday) {
        // request it max once per day
        
        return;
    }

    var piwikRequest = Piwik.require('Network/PiwikApiRequest');

    piwikRequest.setMethod('API.getPiwikVersion');
    piwikRequest.setAccount(account);
    piwikRequest.setCallback(this, function (response) {

        if (!account) {
            
            return;
        }
  
        account.dateVersionUpdated = (new Date()) + '';
        
        if (response) {
            var stringUtils = Piwik.require('Utils/String');
            account.version = stringUtils.toPiwikVersion(response.value);
            stringUtils     = null;
        } else if (!account.version) {
            account.version = 0;
        } else {
            // there went something wrong with the request. For example the network connection broke up.
            // do not set account version to 0 in such a case. We would overwrite an existing version, eg 183
        }

        var accountManager = Piwik.require('App/Accounts');
        accountManager.updateAccount(account.id, {version: account.version, 
                                                  dateVersionUpdated: account.dateVersionUpdated});
        accountManager     = null;
        
        response = null;
    });
    
    // older Piwik versions < 1.8 don't support API.getPiwikVersion. Makes sure those users won't get an error meesage.
    piwikRequest.sendErrors = false;
    
    // execute the request directly. We don't have to add it to a request pool since it doesn't matter when the request
    // finishes. In the worst case the Piwik server version could be outdated for a few seconds
    piwikRequest.send();
    
    piwikRequest = null;
};
    
module.exports = Accounts;