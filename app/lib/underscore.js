/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/** @private */
var Piwik       = require('library/Piwik');
/** @private */
var translation = Piwik.require('Locale/Translation');

// activate and initialize translations
translation.load();

/**
 * Translation wrapper. Use this method if you want to translate any text within the application.
 *
 * @see      Piwik.Locale.Translation#getString
 * 
 * @param    {string}  key
 *
 * @example
 * _('General_Login') // outputs 'Login' if language is english.
 *
 * @returns  {string}  The translated key.
 */
function _ (key) {

    return translation.getString(key);
}

module.exports = _;