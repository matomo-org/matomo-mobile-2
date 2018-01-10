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

var appVersion = require('Piwik').getAppVersion();
 
/**
 * @class    Stores values beyond application sessions. It is possible to store any data except not 
 *           serializable Titanium objects. A storage entry is identfied by a unique string. 
 *           Because settings are also stored in the application store, the class adds a prefix
 *           'cache_' to each key. Each storage entry is automatically expired as soon as the app version changes.
 *           If you need a cache which stores not beyond application sessions, {@link use Piwik.App.Session} instead.
 *           Currently, following keys are in use:
 *           tracking_visitor_uuid     An unique visitor tracking id for this user
 *
 * @static
 */
function Storage () {

    /**
     * A constant which can be used to verify a storage entry. The getter method returns this value if the given key
     * was not found or the key is expired.
     *
     * @example
     * var store = require('Storage');
     * if (store.KEY_NOT_FOUND === store.get('my0815key')) { //key does not exist/is not valid }
     *
     * @type  string
     * @constant
     */
    this.KEY_NOT_FOUND = 'IamNotExistingStorageKeyValue';

    /**
     * Adds a prefix/namespace to each store key because other libraries - like Settings - stores key/values in the
     * same application store. This ensures it does not influence those other libraries.
     *
     * @param    {string}  key  The key used in the application.
     *
     * @returns  {string}  The updated key used internally in the Storage object.
     * 
     * @private
     */
    this._addStorageKeyPrefix = function (key) {

        return 'cache_' + key;
    };

    /**
     * Stores the given value in the application store.
     *
     * The store entry is stored in JSON as a string and contains following values:
     * 'value'   The stored value
     * 'version' The current version of the mobile app.
     *
     * @param   {string}                              key    An unique key which identifies the stored value. The same
     *                                                       identifier is needed to get the stored value.
     * @param   {string|Array|Object|Number|boolean}  value  The value
     *
     * @example
     * var store = require('Storage');
     * store.set('mykey', [1, 2, 3]);       // stores the array under the key 'mykey'
     * store.set('mykey', {key: 'value'});  // stores the object under the key 'mykey'
     * store.get('mykey')                   // returns the previous stored object
     *
     * @throws  {Error} In case of a missing key
     */
    this.set = function (key, value) {

        console.debug('' + key + value, 'Piwik.App.Storage::set');

        if (!key) {

            throw new Error('Missing parameter key');
        }

        var storeEntry = {value: value, version: appVersion};

        key   = this._addStorageKeyPrefix(key);
        value = JSON.stringify(storeEntry);

        Ti.App.Properties.setString(key, value);

        storeEntry     = null;
        value          = null;
    };

    /**
     * Returns the item that was previously stored under the given key. If the item/key is not found or the app
     * version of the storage entry does not match, it returns the const {@link Storage#KEY_NOT_FOUND}.
     *
     * @param    {string}  key  The previously used key to store the value.
     *
     * @returns  {string|Array|Object|Number|boolean}  The value.
     *
     * @throws   {Error}  In case of a missing key
     */
    this.get = function (key) {

        console.debug('' + key, 'Piwik.App.Storage::get');

        if (!key) {

            throw new Error('Missing parameter key');
        }

        key = this._addStorageKeyPrefix(key);

        if (Ti.App.Properties.hasProperty(key)) {

            var storeEntry = Ti.App.Properties.getString(key);
            storeEntry     = JSON.parse(storeEntry);

            // do not invalidate the storage cause of a version mismatch if the key starts with account. Otherwise 
            // previously added accounts will no longer be available and the user has to setup the accounts again
            // @todo we should handle this via an option / parameter in set(key, value, storeBeyondVersions=false) {}
            if ((!storeEntry.version || appVersion !== storeEntry.version)
                 && 0 !== key.indexOf(this._addStorageKeyPrefix('account'))) {

                console.debug('Store invalid because of new app version' + appVersion, 
                                     'Piwik.App.Storage::get#invalid');

                // clear stored entry because entry is not in valid time range
                Ti.App.Properties.removeProperty(key);

                return this.KEY_NOT_FOUND;
            }

            return storeEntry.value;
        }

        console.debug('Not existing key ' + key, 'Piwik.App.Storage::get#notExisting');

        return this.KEY_NOT_FOUND;
    };

    /**
     * Removes the key and the related value from the storage.
     *
     * @param   {string}  key  The key to be removed.
     *
     * @type    null
     *
     * @throws  {Error}  In case of a missing key
     */
    this.remove = function (key) {

        console.debug('' + key, 'Piwik.App.Storage::remove');

        if (!key) {

            throw new Error('Missing parameter key');
        }

        key = this._addStorageKeyPrefix(key);

        if (Ti.App.Properties.hasProperty(key)) {
            Ti.App.Properties.removeProperty(key);
        }
    };
}

module.exports = new Storage();
