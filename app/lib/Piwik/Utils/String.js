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
 * @class    StringUtils
 * 
 * @exports  StringUtils as Piwik.Utils.String
 * @static
 */
function StringUtils () {
}

/**
 * Strip whitespace from the beginning and end of a string.
 * 
 * @param    {string}  str
 *
 * @returns  {string}  The trimmed string
 */
StringUtils.prototype.trim = function (str) {
    
    if (!str) {
        
        return '';
    }

    return ('' + str).replace(/^\s+/, '').replace (/\s+$/, '');
};

/**
 * Adds the size unit, for example dp (densitiy pixels) depending on the current platform.
 * 
 * @param    {string}         str
 *
 * @returns  {string|number}  The converted string on Android, the parsed integer on iOS
 */
StringUtils.prototype.toSizeUnit = function (str) {
    if (!Piwik.getPlatform().isAndroid) {

        return parseInt(str, 10);
    }

    if (!str) {

        return str;
    }

    if (-1 === str.indexOf('dp')) {
        // return Ti.UI.convertUnits(str, Ti.UI.UNIT_DIP);

        return str + 'dp';
    }

    return str;
};

/**
 * Converts a Piwik version string to a number. For example "0.6.4-rc1 => 64", "0.7 => 70", "1.8.0 => 180".
 * The newer the Piwik version, the higher the number.
 * 
 * @param    {string}  str
 *
 * @returns  {number}  The converted number.
 */
StringUtils.prototype.toPiwikVersion = function (piwikVersion) {
    
    if (!piwikVersion) {
        
        return 0;
    }
    
    piwikVersion = piwikVersion + '';

    // compare only first six chars and ignore all dots -> from 0.6.4-rc1 to 064
    // if version was '1.4-rc1', it is '14-rc' now
    piwikVersion = piwikVersion.substr(0, 5).replace(/\./g, '');
    
    // make sure they contain only numbers.
    piwikVersion = piwikVersion.replace(/[^\d]/g, '');
    
    if ((piwikVersion + '').length == 2) {
        // if version is e.g. '0.7' it would be interpreted as 07 (7), but it should be 0.7.0 = 70.
        // Otherwise we run into a bug where 0.6.4 (64) is greater than 0.7 (7).
        piwikVersion = piwikVersion * 10;
    }
    
    if ((piwikVersion + '').length == 1) {
        // if version is e.g. '2' it would be interpreted as 2, but it should be 2.0.0 = 200.
        // Otherwise we run into a bug where 0.6.4 (64) is greater than 2 (2).
        piwikVersion = piwikVersion * 100;
    }
    
    // radix is very important in this case, otherwise eg. 064 octal is 52 decimal
    piwikVersion = parseInt(piwikVersion, 10);
    
    return piwikVersion;
}

module.exports = new StringUtils();