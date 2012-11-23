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
 * @class     An error UI widget is created by the method Piwik.UI.createError. The error UI widget is intended to
 *            display error information to the user instead of simply logging to the log. So the user has a good
 *            chance to give us feedback about the occurred error. Tracks automatically each created error.
 *
 * @param     {Object}        params              See {@link Piwik.UI.View#setParams}
 * @param     {string}        [params.file]       The name of the file in which the exception occurred
 * @param     {number}        [params.line]       The number of the line in which the exception occurred
 * @param     {string}        [params.type]       The exception type. A single word which describes the occurred
 *                                                exception. For example TypeError.
 * @param     {string}        [params.errorCode]  An unique errorCode which allows us to identify where the
 *                                                exception occurred.
 * @param     {Error|string}  params.exception    An instance of an previously occurred error or a string containing
 *                                                an error message.
 *
 * @example
 * try {
 *    throw new Error();
 * } catch (error) {
 *    Piwik.getUI().createError({exception: error}).showErrorMessageToUser();
 * }
 *
 * @example
 * Piwik.getUI().createError({exception: 'An error occurred'}).showErrorMessageToUser();
 *
 * @exports   UiError as Piwik.UI.Error
 * @augments  Piwik.UI.View
 */
function UiError () {
}

/**
 * Extend Piwik.UI.View
 */
UiError.prototype = Piwik.require('UI/View');

/**
 * Initializes the UI error widget. If debugging is enabled in config, it throws the exception. This has the
 * advantage that more information about the occurred exception will be visible. For example file and line where
 * the error occurred.
 *
 * @type  Piwik.UI.Error
 */
UiError.prototype.init = function () {

    var exception = this.getParam('exception');
    var config    = require('config');
    
    if (config.debugging && exception && 'object' == (typeof exception).toLowerCase()) {
        throw exception;
    }

    this.trackError();

    return this;
};

/**
 * Track an occurred error.
 */
UiError.prototype.trackError = function () {

    var exception = this.getParam('exception');
    var line      = this.getParam('line', 'unknown');
    var file      = this.getParam('file', 'unknown');
    var type      = this.getParam('type', 'unknown');
    var errorCode = this.getParam('errorCode', '0');

    if (exception && Piwik.isError(exception)) {

        if (exception.name) {
            type  = exception.name;
        }

        if (exception.sourceURL) {
            file  = exception.sourceURL;
        }

        if (exception.line) {
            line  = exception.line;
        }
    }

    try {
        Piwik.getTracker().trackException({type: type,
                                           errorCode: errorCode,
                                           file: file,
                                           line: line,
                                           message: '' + exception});
    } catch (e) {
        Piwik.getLog().warn('An error occurred while tracking an error... ' + e);
    }
};

/**
 * Displays an error message to the user. Uses an alert dialog to display the error message and contact information.
 *
 * @example
 * showErrorMessageToUser(Error('push() is not defined in HttpRequest'))
 * showErrorMessageToUser('push() is not defined in HttpRequest')
 * showErrorMessageToUser()
 */
UiError.prototype.showErrorMessageToUser = function () {
    var message   = "Please, contact mobile@piwik.org or visit http://piwik.org/mobile\n";
    var exception = this.getParam('exception');

    message      += "Error: ";
    if ('undefined' !== (typeof exception) && exception) {
        message  += exception.toString();
        Piwik.getLog().warn(exception.toString(), 'Piwik.UI.Error::showErrorMessageToUser');
    } else {
        message  += 'Unknown';
    }

    message += "\nPlease, provide the following information:\n";
    message += "System: " + Ti.Platform.name + ' ' + Ti.Platform.version + "\n";

    message += String.format("Piwik Mobile Version: %s - %s %s\n",
                             '' + Ti.App.version, '' + Ti.version, '' + Ti.buildHash);
    message += "Available memory " + Ti.Platform.availableMemory + "\n";

    var caps =  Ti.Platform.displayCaps;
    message += String.format("Resolution: %sx%s %s (%s) \n",
                             '' + caps.platformWidth,
                             '' + caps.platformHeight,
                             '' + caps.density,
                             '' + caps.dpi);

    var alertDialog = Ti.UI.createAlertDialog({
        title: "An error occurred",
        message: message,
        buttonNames: ['OK']
    });

    alertDialog.show();
};

module.exports = UiError;