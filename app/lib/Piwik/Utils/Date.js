/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/**
 * @class    DateUtils
 * 
 * @exports  DateUtils as Piwik.Utils.Date
 * @static
 */
function DateUtils () {
}

/**
 * Convert date to a locale time format.
 * 
 * @param    {Date}    dateObject
 *
 * @returns  {string}  A string containing only the time. Time should be localized. 
 */
DateUtils.prototype.toLocaleTime = function (dateObject) {
    
    if (!dateObject || !dateObject.toLocaleTimeString) {
        
        return '';
    }
    
    return dateObject.toLocaleTimeString().split('GMT')[0];
};

module.exports = new DateUtils();