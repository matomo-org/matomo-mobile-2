/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/**
 * @class    Root namespace of the piwik library.
 *
 * @exports  Piwik as Piwik
 * @static
 */
var Piwik        = {};

/**
 * A simple loading system to load any file/module from the Piwik library. If requested module is a class/function, 
 * it will automatically instantiate the module and return the instance. If requested module is an object, it'll 
 * simply return the object.
 *
 * @param    {string}  module  The name of the module you want to load. For example 'App/Session' loads 
 *                             Piwik.App.Session. Do not add the file extension '.js' to the module name. 
 *
 * @example
 * var session  = Piwik.require('App/Session')
 * var profiler = Piwik.require('Profiler')
 *
 * @returns  {Object}
 */
Piwik.require = function (module) {

    var file   = 'library/Piwik/' + module;
    
    var target = require(file);
    
    if ('object' == (typeof target).toLowerCase()) {

        return target;
    }

    if ('function' == (typeof target).toLowerCase()) {

        return new target();
    }
    
    return target;
};

/**
 * Loads and returns the given window class.
 *
 * @param    {string}  file  The path and name of the window file relative to the 'Resources/windows/' directory without
 *                           the .js file extension.
 *
 * @example
 * Piwik.requireWindow('chart/show')
 *
 * @returns  {Function}  The requested window
 */
Piwik.requireWindow = function (file) {

    file = 'windows/' + file;
    
    try {
        var window  = require(file);
    } catch (exception) {

        var uiError = Piwik.getUI().createError({exception: exception, errorCode: 'PiPiRw19'});
        uiError.showErrorMessageToUser();
        
        window      = null;
    }

    return window;
};

/**
 * A simple way to check whether a variable is an object.
 * 
 * @param  {null|function|string|number|boolean|Object|Array}  obj
 * 
 * @type   boolean
 */
Piwik.isObject = function (obj) {

    if ((obj instanceof Object)) {
        // unfortunately this simple check does currently not work on Android under some circumstances (when a variable
        // is passed between a different require context). See http://jira.appcelerator.org/browse/TIMOB-7258
        obj = null;

        return true;
    }

    if (this.getPlatform().isIos) {
        obj = null;
        
        return false;
    }
    
    // workaround for Android

    var objToString = Object.prototype.toString.call(obj);
    if ('object' == (typeof obj) && objToString && -1 !== objToString.toLowerCase().indexOf('object object')) {
        obj = null;

        return true;
    }
    
    obj = null;
    
    return false; 
};

/**
 * A simple way to check whether a variable is an Error (exception).
 * 
 * @param  {null|function|string|number|boolean|Object|Array}  err
 * 
 * @type   boolean
 */
Piwik.isError = function (err) {

    if ((err instanceof Error)) {
        // unfortunately this simple check does currently not work on Android under some circumstances (when a variable
        // is passed between a different require context). See http://jira.appcelerator.org/browse/TIMOB-7258
        err = null;

        return true;
    }

    if (this.getPlatform().isIos) {
        err = null;
        
        return false;
    }
    
    // workaround for Android

    var errToString = Object.prototype.toString.call(err);
    if (errToString && -1 !== errToString.toLowerCase().indexOf('error')) {
        err = null;

        return true;
    }
    
    err = null;
    
    return false; 
};

/**
 * A simple way to check whether a variable is an array.
 * 
 * @param  {null|function|string|number|boolean|Object|Array}  obj
 * 
 * @type   boolean
 */
Piwik.isArray = function (arr) {
    
    if ((arr instanceof Array || 'array' == (typeof arr))) {
        // unfortunately this simple check does currently not work on Android under some circumstances (when a variable
        // is passed between a different require context). See http://jira.appcelerator.org/browse/TIMOB-7258
        arr = null;
        
        return true;
    }
    
    if (this.getPlatform().isIos) {
        arr = null;
        
        return false;
    }
    
    // workaround for Android

    var arrToString = Object.prototype.toString.call(arr);
    if (arrToString && -1 !== arrToString.toLowerCase().indexOf('array')) {
        arr = null;

        return true;
    }
    
    arr = null;
    
    return false;
};

/**
 * Returns a profiler instance.
 *
 * @type  Piwik.Profiler
 */
Piwik.getProfiler = function () {
    if (!this.profiler) {
        this.profiler  = this.require('Profiler');
    }

    return this.profiler;
};

/**
 * Returns a tracker instance.
 *
 * @type  Piwik.Tracker
 */
Piwik.getTracker = function () {
    if (!this.tracker) {
        this.tracker  = this.require('Tracker');
    }

    return this.tracker;
};

/**
 * Returns a logger instance.
 *
 * @type  Piwik.Log
 */
Piwik.getLog = function () {
    if (!this.logger) {
        this.logger = this.require('Log');
    }

    return this.logger;
};

/**
 * Returns a UI instance.
 *
 * @type  Piwik.UI
 */
Piwik.getUI = function () {
    if (!this.ui) {
        this.ui = this.require('UI');
    }

    return this.ui;
};

/**
 * Returns a platform instance.
 *
 * @type  Piwik.Platform
 */
Piwik.getPlatform = function () {
    if (!this.platform) {
        this.platform  = this.require('Platform');
    }

    return this.platform;
};

/**
 * Returns a network instance.
 *
 * @type  Piwik.Network
 */
Piwik.getNetwork = function () {
    if (!this.network) {
        this.network  = this.require('Network');
    }

    return this.network;
};

module.exports = Piwik;