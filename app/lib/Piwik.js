/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/**
 * Make sure actual >= expected.
 * 
 * @param  string expected Any Piwik version number. For example '0.6.4-rc1' or '1.4-beta1' or '1.10.1' or '2.0'
 * @param  string actual   Any Piwik version number. For example '0.6.4-rc1' or '1.4-beta1' or '1.10.1' or '2.0'
 * 
 * @return true if the actual version number is greater than or equal to the expected version number, false otherwise.
 */
exports.isVersionGreaterThanOrEqual = function (expected, actual) {

    expected = '' + expected;
    actual   = '' + actual;

    var expectedParts = expected.split('.');
    var actualParts   = actual.split('.');
    
    for (var i = 0; i < expectedParts.length; ++i) {
        if (actualParts.length == i) {
            return false;
        }

        var expectedPart = parseInt(expectedParts[i], 10);
        var actualPart   = parseInt(actualParts[i], 10);
        
        if (expectedPart == actualPart) {
            continue;

        } else if (expectedPart > actualPart) {

            return false;

        } else {

            return true;
        }
    }
    
    return true;
};

exports.getAppVersion = function () {
    var version = Ti.App.version;

    if (!version && OS_MOBILEWEB) {
        if (Ti && Ti.App && Ti.App.__def__ && Ti.App.__def__.constants && Ti.App.__def__.constants.version) {
            version = Ti.App.__def__.constants.version;
        } else {
            console.warn('There is a version hack in give_feedback that no longer works');
        }
    } else if (OS_MOBILEWEB) {
        console.warn('There is a version hack in give_feedback that can be removed');
    }
    
    return version;
};

/**
 * A simple way to check whether a variable is an Error (exception).
 * 
 * @param  {null|function|string|number|boolean|Object|Array}  err
 * 
 * @type   boolean
 */
exports.isError = function (err) {

    if ((err instanceof Error)) {
        // unfortunately this simple check does currently not work on Android under some circumstances (when a variable
        // is passed between a different require context). See http://jira.appcelerator.org/browse/TIMOB-7258
        err = null;

        return true;
    }

    if (OS_IOS) {
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
