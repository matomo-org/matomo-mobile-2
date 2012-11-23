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
 * @class    This simple session manager preserves certain data across multiple Piwik.UI.Windows. Each session entry is
 *           identified by an unique key and is accessible as long as the app session persists. The session is a
 *           simple and very fast cache. 
 *           Currently, following keys are in use:
 *           piwik_sites_allowed                                 All allowed sites an user has at least view access
 *           piwik_parameter_period                              The current selected period
 *           piwik_parameter_date                                The current selected date
 *           piwik_report_metadata_{accountId}_{idSite}_{lang}   Report metadata for a specific account
 *           modal_window_opened                                 Whether currently a modal window is opened or not
 *           current_site                                        The current active/selected site
 *           piwik_version_{accountId}                           The piwik core version number of the account
 *
 * @example
 * var session = require('Session');
 * session.set('period', 'week');   // store the value week under the key period
 * session.get('period');           // fetch the value of the key period, stored in the session
 *
 * @exports  Session as Piwik.App.Session
 * @static
 */
function Session () {

    /**
     * All current available values will be stored in this object under the regarding key.
     *
     * Object (
     *    [key] => [value]
     * )
     *
     * @type  Object
     */
    this.values = {};

    /**
     * Returns the value that was previously stored in the session under the given key. If the key is not found,
     * it returns the default value or null if no default value was specified.
     *
     * @param    {string}                              key             A previously used key.
     * @param    {string|Array|Object|Number|boolean}  [defaultValue]  Optional default value if no value is stored
     *                                                                 under this key.
     *
     * @example
     * var session = require('Session');
     * session.get('period', 'day');
     *
     * @returns  {string|Array|Object|Number|boolean} The value.
     *
     * @throws   {Error}  In case of a missing key
     */
    this.get = function (key, defaultValue) {

        Piwik.getLog().debug(key, 'Piwik.App.Session::get');

        if (!key) {
            throw new Error('Missing parameter key');
        }

        if ('undefined' !== (typeof this.values[key])) {

            return this.values[key];
        }

        if ('undefined' !== (typeof defaultValue)) {

            return defaultValue;
        }
    };

    /**
     * Stores the given value under the given key.
     *
     * @param   {string}                              key    A unique key which identifies the stored value. The same
     *                                                       identifier is needed to get the stored value.
     * @param   {string|Array|Object|Number|boolean}  value  The value you want to store
     *
     * @example
     * var session = require('Session');
     * session.set('period', 'year');
     * session.get('period');  // = 'year'
     *
     * @type    null
     * @throws  {Error} In case of a missing key
     */
    this.set = function (key, value) {

        Piwik.getLog().debug(key, 'Piwik.App.Session::set');

        if (!key) {
            throw new Error('Missing parameter key');
        }

        this.values[key] = value;
        
        value = null;
        key   = null;
    };

    /**
     * Removes the key and the related value from the session.
     *
     * @param    {string}   key  The key to be removed.
     *
     * @returns  {boolean}  true if an existing key/value pair was removed, false otherwise.
     *
     * @throws   {Error}    In case of a missing key
     */
    this.remove = function (key) {

        Piwik.getLog().debug(key, 'Piwik.App.Session::remove');

        if (!key) {

            throw new Error('Missing parameter key');
        }

        if ('undefined' != (typeof this.values[key])) {

            this.values[key] = null;
            delete this.values[key];

            return true;
        }

        return false;
    };
}

module.exports = new Session();