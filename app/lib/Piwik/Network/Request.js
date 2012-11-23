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
 * @class    Provides methods needed in most Network Requests. Serves as a base class for network classes. A request
 *           should extend this class.
 * 
 * @exports  Request as Piwik.Network.Request
 */
function Request () {
    
    /**
     * A prefix for event handlers. Fixes an issue that the same event names fires multiple times. Cause other requests
     * do also fire 'onload' event on the same object (Piwik.UI.currentWindow)
     *
     * @type  string
     * 
     * @private
     */
    this.eventPrefix = null;
    
    this.events      = null;
}

/**
 * Add an event listener to receive triggered events. The callback will be executed in the
 * Piwik.UI.Window context.
 *
 * @param  {string}    name      Name of the event you want to listen to.
 * @param  {Function}  callback  Callback function to invoke when the event is fired
 */
Request.prototype.addEventListener = function (name, callback) {
    
    if (null === this.events) {
        this.events = [];
    }

    if (!this.eventPrefix) {
        this.eventPrefix = String(Math.random()).slice(2,8);
    }
    
    var eventName = this.eventPrefix + name;
 
    this.events.push({event: eventName, callback: callback});
    
    callback = null;
};

/**
 * Fires an event to all listeners. The event will be fired in {@link Piwik.UI.Window} context.
 *
 * @param  {string}    name   Name of the event you want to fire.
 * @param  {Function}  event  An event object that will be passed to the callback function which was added
 *                            via addEventListener.
 */
Request.prototype.fireEvent = function (name, event) {
    
    if (null === this.events) {
        this.events = [];
    }
    if (!this.eventPrefix) {
        this.eventPrefix = String(Math.random()).slice(2,8);
    }
    
    var eventName = this.eventPrefix + name;

    for (var index = 0; index < this.events.length; index++) {
        if (eventName == this.events[index].event) {
            this.events[index].callback.apply(this, [event]);
        }
    }

    event = null;
};

/**
 * Fires an event to all listeners. The event will be fired in {@link Piwik.UI.Window} context.
 *
 * @param  {string}    name   Name of the event you want to fire.
 * @param  {Function}  event  An event object that will be passed to the callback function which was added
 *                            via addEventListener.
 */
Request.prototype.cleanup = function () {
    
    if (!this.eventPrefix) {
        return;
    }

    for (var index = 0; index < this.events.length; index++) {

        if (this.events[index] && this.events[index].callback) {
            this.events[index].callback = null;
        }
        
        this.events[index] = null;
    }

    this.events      = null;
    this.eventPrefix = null;
};

module.exports = Request;