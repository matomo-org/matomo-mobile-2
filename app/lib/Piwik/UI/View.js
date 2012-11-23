/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/**
 * @class    Provides methods needed in most UI widgets. Serves as a base class for each UI class. An UI widget
 *           should extend this class and make an 'init' method available. The init method is called once an UI
 *           widget is created.
 * 
 * @exports  UiView as Piwik.UI.View
 */
function UiView () {
    this.params      = null;

    /**
     * A prefix for event handlers. Fixes an issue that the same event names fires multiple times. Otherwise all Piwik
     * UI objects do fire events on the same object/context (Piwik.UI.currentWindow).
     *
     * @type  string
     * 
     * @private
     */
    this.eventPrefix = null;
}

/**
 * Sets (overwrites) the params.
 *
 * @param  {Object}  params  Params used to affect how the UI widget shall work. Each widget has to define his own
 *                           params as needed.
 *
 * @type   null
 */
UiView.prototype.setParams = function (params) {
    this.params = null;
    this.params = params;
    params      = null;
};

/**
 * Retrieve a single value from previous set params.
 *
 * @param    {string}  key             The name of the property/param you want to retrieve.
 * @param    {*}       [defaultValue]  The defaultValue which will be returned if the params does not have
 *                                     such a property.
 *
 * @returns  Returns the value of the requested param if this is defined or the defaultValue if one specified.
 *           In all other cases it returns null.
 */
UiView.prototype.getParam = function (name, defaultValue) {

    var params = this.getParams();

    if (name && 'undefined' !== (typeof params[name])) {
        var value    = params[name];
        params       = null;
        defaultValue = null;

        return value;
    }

    if ('undefined' !== (typeof defaultValue)) {
        params = null;

        return defaultValue;
    }
};

/**
 * Retrieve all previous set params.
 *
 * @returns  {Object}  An object as set in {@link Piwik.UI.View#setParams}
 */
UiView.prototype.getParams = function () {

    if (!this.params) {
        this.params = {};
    }

    return this.params;
};

/**
 * Fires an event to all listeners. The event will be fired in {@link Piwik.UI.View} context.
 *
 * @param  {string}    name   Name of the event you want to fire.
 * @param  {Function}  event  An event object that will be passed to the callback function which was added
 *                            via addEventListener.
 */
UiView.prototype.fireEvent = function (name, event) {

    if (!this.eventPrefix) {
        this.eventPrefix = String(Math.random()).slice(2,8);
    }
    
    name = this.eventPrefix + name;
    
    var window = this.getParam('window');
    if (window) {
        // @todo fire event not in window. fire event in an own view specfic context
        window.fireEvent(name, event);
    }
    
    window = null;
    event  = null;
};

/**
 * Fires an event to all listeners. The event will be fired in {@link Piwik.UI.Window} context. 
 *
 * @param  {string}    name   Name of the event you want to fire.
 * @param  {Function}  event  An event object that will be passed to the callback function which was added
 *                            via addEventListener.
 */
UiView.prototype.fireEventInWindow = function (name, event) {

    var window = this.getParam('window');
    
    if (!window) {
        var Piwik = require('library/Piwik');
        Piwik.getLog().warn('Failed to fireEventInWindowContext: + ' + name + ' . Window does not exist', 
                            'Piwik.UI.View::fireEventInWindowContext');
        window = null;
        event  = null;
        return;
    }

    window.fireEvent(name, event);
    
    window = null;
    event  = null;
};

UiView.prototype.create = function (widget, params) {
    
    var window = this.getParam('window');
    if (window) {
        return window.create(widget, params);
    } 
    
    Piwik.getLog().warn('No window exists do create widget', 'Piwik.UI.View::create');
};

UiView.prototype.createCommand = function (commandName, params) {
    
    var window = this.getParam('window');
    if (window) {
        return window.createCommand(commandName, params);
    }
    
    Piwik.getLog().warn('No window exists do create command', 'Piwik.UI.View::createCommand');
};

/**
 * Add an event listener to receive triggered events. The callback will be executed in the
 * {@link Piwik.UI.View} context.
 *
 * @param  {string}    name      Name of the event you want to listen to.
 * @param  {Function}  callback  Callback function to invoke when the event is fired
 */
UiView.prototype.addEventListener = function (name, callback) {

    if (!this.eventPrefix) {
        this.eventPrefix = String(Math.random()).slice(2,8);
    }
    
    name = this.eventPrefix + name;
    
    var window = this.getParam('window');
    if (window) {
        window.addEventListener(name, callback);
    }
    
    callback   = null;
    window     = null;
};

/**
 * Remove a previously added event listener
 *
 * @param  {string}    name      Name of the event you want to remove.
 * @param  {Function}  callback  Callback function passed in addEventListener.
 */
UiView.prototype.removeEventListener = function (name, callback) {

    if (!this.eventPrefix) {
        this.eventPrefix = String(Math.random()).slice(2,8);
    }
    
    name = this.eventPrefix + name;
    
    var window = this.getParam('window');
    if (window) {
        window.removeEventListener(name, callback);
    }
    
    callback   = null;
    window     = null;
};

/**
 * This method is called to initialize an UI widget.
 *
 * @type  Piwik.UI.View
 */
UiView.prototype.init = function () {
    throw new Error('init() method is not implemented by the UI widget');
};

module.exports = UiView;