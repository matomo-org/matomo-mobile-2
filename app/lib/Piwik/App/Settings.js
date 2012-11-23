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
 * @class    Stores settings beyond application sessions. The stored values are available as long as the user does 
 *           not uninstall the app. Use always this object to access settings. Ti.App.Properties is used to store
 *           the settings.
 *
 * @exports  Settings as Piwik.App.Settings
 * @static
 */
function Settings () {

    /**
     * Sets (overwrites) the current language.
     *
     * @param  {string}  value  The current language locale. For example 'de', 'en', ...
     *
     * @type   null
     */
    this.setLanguage = function (value) {
        this._set('piwikLanguage', 'String', value);
        
        value = null;
    };

    /**
     * Retrieve the stored language value.
     *
     * @returns  {string}  the stored language locale. For example 'de', 'en', ...
     */
    this.getLanguage = function () {
        return this._get('piwikLanguage', 'String');
    };

    /**
     * Sets (overwrites) whether the display of sparklines in multisite view (welcome screen) is enabled or disabled.
     * Setting should be disabled by default because it needs more time (depending on network, loading time) to start
     * the app when enabled and requires a bit more memory.
     *
     * @param  {boolean}  value  true to enable sparklines, false otherwise.
     *
     * @type   null
     */
    this.setPiwikMultiChart = function (value) {

        value = Boolean(value);

        this._set('piwikMultiChart', 'Bool', value);
        
        value = null;
    };

    /**
     * Retrieve the stored multichart value.
     *
     * @returns  {boolean}  true if sparklines in multisite view are enabled, false otherwise.
     */
    this.getPiwikMultiChart = function () {
        return this._get('piwikMultiChart', 'Bool', config.piwik.multiChartEnabled);
    };

    /**
     * Sets (overwrites) whether the anonymous tracking within Piwik Mobile is enabled or disabled.
     *
     * @param  {boolean}  value  true to enable tracking, false otherwise.
     *
     * @type   null
     */
    this.setTrackingEnabled = function (value) {

        value = Boolean(value);

        this._set('trackingEnabled', 'Bool', value);
        
        value = null;
    };

    /**
     * Retrieve the stored tracking enabled value.
     *
     * @returns  {boolean}  true if user has enabled tracking, false otherwise.
     */
    this.isTrackingEnabled = function () {
        return this._get('trackingEnabled', 'Bool', config.piwik.trackingEnabled);
    };

    /**
     * Sets (overwrites) whether the display of graphs in statistics is enabled or disabled.
     *
     * @param  {boolean}  value  true to enable graphs, false otherwise.
     *
     * @type   null
     */
    this.setGraphsEnabled = function (value) {

        value = Boolean(value);

        this._set('graphsEnabled', 'Bool', value);
        
        value = null;
    };

    /**
     * Retrieve the stored graphsEnabled value.
     *
     * @returns  {boolean}  true if graphs are enabled, false otherwise.
     */
    this.getGraphsEnabled = function () {
        return this._get('graphsEnabled', 'Bool', config.piwik.graphsEnabled);
    };

    /**
     * Sets (overwrites) whether we should prefer evolution graphs or not.
     *
     * @param  {boolean}  value  true if app should prefer evolution graphs, false otherwise.
     *
     * @type   null
     */
    this.setPreferEvoltuionGraphs = function (value) {

        value = Boolean(value);

        this._set('preferEvolutionGraphs', 'Bool', value);
        
        value = null;
    };

    /**
     * Retrieve the stored preferEvolutionGraphs value.
     *
     * @returns  {boolean}  true if graphs are enabled, false otherwise.
     */
    this.getPreferEvoltuionGraphs = function () {
        return this._get('preferEvolutionGraphs', 'Bool', config.piwik.preferEvolutionGraphs);
    };

    /**
     * Sets (overwrites) the http timeout value.
     *
     * @param  {int}  value  The timeout value in ms.
     *
     * @type   null
     */
    this.setHttpTimeout = function (value) {
        return this._set('httpTimeout', 'Int', value);
    };

    /**
     * Retrieve the stored http timeout value in ms.
     *
     * @returns  {int}  The timeout value.
     */
    this.getHttpTimeout = function () {

        var timeoutValue = this._get('httpTimeout', 'Int', config.piwik.timeout);
        timeoutValue     = parseInt(timeoutValue, 10);

        return timeoutValue;
    };

    /**
     * Sets (overwrites) the default piwik report date. The value will be stored in format 'period##date'. We do not
     * store this in two different settings cause it is only one visible setting within the app. We can not update two
     * different settings (date and period) when user selects another value. For example if user selects "current week"
     * we can not update both period 'week' and date 'today' in different settings on iOS via 'Settings.bundles'.
     *
     * For example 'week##yesterday'.
     *
     * @param  {string}  period  The default period, for example week or day
     * @param  {string}  date    The default date, for example today or yesterday
     *
     * @type   null
     */
    this.setPiwikDefaultReportDate = function (period, date) {
        var value = period + '##' + date;

        return this._set('piwikDefaultReportDate', 'String', value);
    };

    /**
     * Retrieve the stored default piwik report date. The default report date is stored as follows: 'period##date'
     *
     * For example 'week##yesterday'.
     *
     * @see <a href="http://dev.piwik.org/trac/wiki/API/Reference#Standardparameters">Standard parameters</a>
     *
     * @returns  {null|string}  The default piwik report date. It returns a default value if value was not set before.
     */
    this.getPiwikDefaultDate = function () {
        var reportDate = this.getPiwikDefaultReportDate();

        if (!reportDate) {

            return null;
        }

        var values     = reportDate.split('##');
        reportDate     = null;

        return values[1] ? values[1] : null;
    };

    /**
     * Retrieve the stored default piwik report period.
     *
     * @see <a href="http://dev.piwik.org/trac/wiki/API/Reference#Standardparameters">Standard parameters</a>
     *
     * @returns  {null|string}  The default piwik report period. It returns a default value if value was not set before.
     */
    this.getPiwikDefaultPeriod = function () {
        var reportPeriod = this.getPiwikDefaultReportDate();

        if (!reportPeriod) {

            return null;
        }

        var values       = reportPeriod.split('##');
        reportPeriod     = null;

        return values[0] ? values[0] : null;
    };

    /**
     * Retrieve the stored default piwik report date. The value is stored in format period##date.
     *
     * @returns  {string}  The default piwik report date. It returns a default value if value was not set before.
     */
    this.getPiwikDefaultReportDate = function () {
        return this._get('piwikDefaultReportDate', 'String', config.piwik.defaultReportDate);
    };

    /**
     * Retrieve a setting which was previously stored under the given key.
     *
     * @param    {string}              key             An unique key which identifies a specific setting.
     * @param    {string}              type            The expected type of data. 'Bool', 'Int' or 'String'
     * @param    {string|boolean|int}  [defaultValue]  Optional default value if no value is stored under this key.
     *
     * @returns  {string|boolean|int|null}  Tries to retrieve the stored value. If the key is not found and a 
     *                                      defaultValue is given, it returns the defaultValue. Returns null in all 
     *                                      other cases.
     *
     * @private
     */
    this._get = function (key, type, defaultValue) {
        Piwik.getLog().debug(type + ' ' + key, 'Piwik.App.Settings::_get');

        key = this._addSettingsKeyPrefix(key);

        if (this[key]) {
            // use cached value if exists
            
            return this[key];
        }

        if (!defaultValue && type && 'Bool' === type) {
            defaultValue = false;
        }

        if (!defaultValue && type && 'Int' === type) {
            defaultValue = 0;
        }

        if (!Ti.App.Properties.hasProperty(key)) {
            if ('undefined' !== (typeof defaultValue)) {

                return defaultValue;
            }
            
            return null;
        }

        var value;

        if (type && 'Bool' === type) {

            value = Ti.App.Properties.getBool(key, defaultValue);

        } else if (type && 'Int' === type) {

            value = Ti.App.Properties.getInt(key, parseInt(defaultValue, 10));

        } else {

            value = Ti.App.Properties.getString(key);
        }

        // cache value
        this[key] = value;

        return value;
    };

    /**
     * Stores a setting in the application store.
     *
     * @param  {string}              key    An unique key which identifies a specific setting.
     * @param  {string}              type   Identifies what type of data the value is.
     * @param  {string|boolean|int}  value  The value which should be stored.
     *
     * @type   null
     *
     * @private
     */
    this._set = function (key, type, value) {
        Piwik.getLog().debug('' + type + key + value, 'Piwik.App.Settings::_set');

        key       = this._addSettingsKeyPrefix(key);

        this[key] = value;

        if (type && 'Bool' === type) {

            return Ti.App.Properties.setBool(key, value);
        }

        if (type && 'Int' === type) {
            this[key] = parseInt(value, 10);

            return Ti.App.Properties.setInt(key, parseInt(value, 10));
        }

        var result = Ti.App.Properties.setString(key, value);
        value      = null;
        
        return result;
    };

    /**
     * Adds an prefix/namespace to each setting key because other libraries - like Cache - stores key/values in the
     * same application store. This ensures it does not influence those other libraries.
     *
     * @param    {string}  key The key used in the application.
     *
     * @returns  {string}  The updated key used internally in the Cache object.
     * 
     * @private
     */
    this._addSettingsKeyPrefix = function (key) {

        return 'setting_' + key;
    };
}

module.exports = new Settings();