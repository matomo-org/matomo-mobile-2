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
 * @class    Provides a simple profiler. The profiler logs all profiling information to the standard iOS/Android SDK log
 *           which is accessible for example in Titanium Developer.
 * 
 * @static
 */
function Profiler () {

    /**
     * Enables/disables profiling. If enabled, it logs the elapsed time in ms between two logging calls and the current
     * available memory. Should be disabled in a production release (for performance reasons).
     *
     * @type  boolean
     */
    this.ENABLED = false;

    /**
     * Holds the number of milliseconds since 1/1/1970. Will be updated on each step() call if profiling is enabled.
     *
     * @type  null|int
     */
    this.time    = null;

    /**
     * Logs the elapsed time since the last step() call as well as the current available free memory if profiling is
     * enabled.
     *
     * @todo  instead of simply logging the 'now available memory' we could additionally log the used memory since
     *        the start call. 
     */
    this.step = function () {
        if (!this.ENABLED) {
            
            return;
        }

        if (!this.time) {
            this.time = new Date().getTime();

            return;
        }

        var now   = new Date().getTime();

        Ti.API.debug("Time: " + (now - this.time) + 'ms');
        Ti.API.debug("Free mem: " + (Ti.Platform.availableMemory / 1000) + 'kb');

        this.time = now;
    };

    /**
     * Start profiling. Just for debugging purposes and to measure performance. Start the profiling by calling
     * start() and finish the profiling by calling end(). The used key to start and to end the profiling has to be the
     * same.
     *
     * @example
     * require('Profiler').start('renderStatisticList');
     * require('Profiler').start('renderHeaderRow');
     * require('Profiler').end('renderHeaderRow');
     * require('Profiler').end('renderStatisticList');
     *
     * @param  {string}  key  A key which describes the current profiling
     */
    this.start = function (key) {
        if (!this.ENABLED) {

            return;
        }

        this['profilingMem' + key]  = '' + Ti.Platform.availableMemory;
        this['profilingDate' + key] = new Date().getTime();
    };

    /**
     * Finishes a previous started profiling. Logs needed time in ms and currently available free memory to console
     * using warning level.
     *
     * @see    Profiler#start
     *
     * @param  {string}  key  A key which describes the current profiling and which was used in the start method.
     */
    this.end = function (key) {
        if (!this.ENABLED) {

            return;
        }
        
        var now = new Date().getTime();

        if ('undefined' === (typeof this['profilingDate' + key]) || !this['profilingDate' + key]) {
            Ti.API.warn('You have to call this.start("' + key + '")');

            return;
        }

        var startTime = this['profilingDate' + key];
        var startMem  = this['profilingMem' + key];

        delete this['profilingDate' + key];

        Ti.API.warn('' + key + ': ' + (now - startTime) + 'ms');
        Ti.API.warn('' + key + ' Start free mem: ' + startMem + 'b');
        Ti.API.warn('' + key + ' Now free mem: ' + Ti.Platform.availableMemory + 'b');
    };
}

module.exports = new Profiler();
