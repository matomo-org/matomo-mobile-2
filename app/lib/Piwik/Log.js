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
 * @class    Provides a simple logger. Logs messages to standard iOS/Android SDK log which is accessible for example
 *           via Titanium Developer. Uses the Titanium.API module to log messages.
 * 
 * @exports  Log as Piwik.Log
 * @static
 */
function Log () {

    /**
     * True if logging is enabled, false otherwise. Should be disabled in a production release.
     *
     * @type  boolean
     */
    this.ENABLED  = config.logEnabled;

    /**
     * An instance of any profiler. For example Piwik.Profiler.
     *
     * @type  Object
     */
    this.profiler = null;

    /**
     * Sets the profiler. The profiler has to implement at least a method named 'step'. Otherwise the profiler will
     * not be used. The 'step' method will be triggered on each logging call.
     * 
     * @param  {Object}  profiler
     */
    this.setProfiler = function (profiler) {
        if (!profiler || !profiler.step) {
            // has the profiler implemented the required method 'step'? Do not accept the logger if not.

            if (this.ENABLED) {
                Ti.API.warn('No valid profiler set', 'Piwik.Log::setProfiler');
            }
            
            profiler  = null;

            return;
        }

        this.profiler = profiler;
        profiler      = null;
    };

    /**
     * Logs debug messages. It is recommended to always define a title, but not required. Logs the message only if
     * logging is enabled.
     *
     * @param  {string|Array|Object|Number|boolean|null}  message  The proper message/value. The message is
     *                                                             automatically converted to JSON If message is not a 
     *                                                             string.
     * @param  {string|Array|Object|Number|boolean|null}  [title]  Optional title. Preceded to the message. The title is
     *                                                             automatically converted to JSON if message is not a
     *                                                             string.
     *
     * @example
     * Piwik.getLog().debug([1, 2, 3], 'Piwik.UI.Menu::create');
     */
    this.debug = function (message, title) {
        if (!this.ENABLED) {
            message = null;
            title   = null;
            
            return;
        }

        var logMessage  = '';

        if (title) {
            logMessage += this.stringify(title) + ': ';
        }

        logMessage     += this.stringify(message);

        // trigger step() before logging the message. This ensures the profiling output appears in log before the next
        // logging message.
        if (this.profiler) {
            this.profiler.step();
        }

        Ti.API.debug(logMessage);

        logMessage = null;
        message    = null;
        title      = null;
    };

    /**
     * Converts the log message to JSON or anything else readable if type of log is not already a string.
     *
     * @returns  {string}  The converted value.
     */
    this.stringify = function (log) {

        if ('undefined' === (typeof log)) {
            log = null;

            return 'undefined';
        }

        if (null === log) {

            return 'null';
        }

        if ('string' === (typeof log).toLowerCase()) {

            return log;
        }

        try {
            
            var message = JSON.stringify(log);
            log         = null;

            return message;

        } catch (e) {

            var type = (typeof log);

            return type;
        }
    };

    /**
     * Logs error messages. Use this only in case of a "real error". Just be a bit careful.
     *
     * @param  {string|Array|Object|Number|boolean|null}  message  The proper message/value. The message is
     *                                                             automatically converted to JSON If message is not a 
     *                                                             string.
     * @param  {string|Array|Object|Number|boolean|null}  [title]  Optional title. Preceded to the message. The title is
     *                                                             automatically converted to JSON if message is not a
     *                                                             string.
     */
    this.error = function (message, title) {
        if (!this.ENABLED) {
            message = null;
            title   = null;
            
            return;
        }

        var logMessage  = '';

        if (title) {
            logMessage += this.stringify(title) + ': ';
        }

        logMessage     += this.stringify(message);

        if (this.profiler) {
            this.profiler.step();
        }

        Ti.API.error(logMessage);

        logMessage = null;
        message    = null;
        title      = null;
    };

    /**
     * Logs warning messages.
     *
     * @param  {string|Array|Object|Number|boolean|null}  message  The proper message/value. The message is 
     *                                                             automatically converted to JSON If message is not a 
     *                                                             string.
     * @param  {string|Array|Object|Number|boolean|null}  [title]  Optional title. Preceded to the message. The title is
     *                                                             automatically converted to JSON if message is not a
     *                                                             string.
     */
    this.warn = function (message, title) {
        if (!this.ENABLED) {
            message = null;
            title   = null;
            
            return;
        }

        var logMessage  = '';

        if (title) {
            logMessage += this.stringify(title) + ': ';
        }

        logMessage     += this.stringify(message);

        if (this.profiler) {
            this.profiler.step();
        }

        Ti.API.warn(logMessage);

        logMessage = null;
        message    = null;
        title      = null;
    };
    
    var profiler = Piwik.getProfiler();
    if (profiler.ENABLED) {
        this.setProfiler(profiler);
    }
    
    profiler     = null;
}

module.exports = new Log();