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
 * @class    Provides some translation related methods. The translations for each language are stored within the
 *           'Resources/i18n' folder. These files can be generated/updated via the python script
 *           'tools/updatelanguagefiles.py'.
 *
 * @see      <a href="http://dev.piwik.org/trac/wiki/API/Reference#LanguagesManager">Piwik Languages Manager</a>
 *
 * @exports  Translation as Piwik.Locale.Translation
 * @static
 */
function Translation () {
    
    /**
     * The translations depending on the current active/selected locale.
     * 
     * @type  null|Object
     *
     * Object ( [translationKey] => [Translated value] )
     */
    this.translations = null;

    /**
     * Default translations are used if no language was chosen or if chosen language is not provided by
     * the piwik LanguageManager.
     *
     * @type Object
     *
     * Object ( [translationKey] => [default translation] )
     *
     * @constant
     */
    this.DEFAULT_TRANSLATION = require('i18n/default');

    /**
     * Returns the translation for the given key if one exists or the key itself if not.
     *
     * @param    {string}  key  key to translation
     *
     * @returns  {string}  Translated key. Uses the value defined in {@link Piwik.LocaleTranslation#translations} or 
     *                     the default translation if no translation exists for the given key. If even the default 
     *                     value does not exist it returns the key and logs an error. In such a case you have to 
     *                     define a default translation for the given key, 
     *                     see {@link Piwik.LocaleTranslation#DEFAULT_TRANSLATION}.
     */
    this.getString = function (key) {

        if (this.translations && this.translations[key]) {

            return this.translations[key];
        }

        if (this.DEFAULT_TRANSLATION[key]) {

            return this.DEFAULT_TRANSLATION[key];
        }

        Piwik.getLog().error('Missing default translation for key ' + key, 'Piwik.Locale.Translation::get');

        return key;
    };

    /**
     * Fetches all needed translations depending on the current locale.
     */
    this.load = function () {

        var locale = Piwik.require('Locale');
        locale     = locale.getLocale();

        try {
            this.translations = require('i18n/' + locale);
        } catch (e) {
            Piwik.getLog().error('Failed to load translations for locale ' + locale, 'Piwik.Locale.Translation::load');

            var uiError = Piwik.getUI().createError({exception: e, errorCode: 'PiTrLo35'});
            uiError.showErrorMessageToUser();
        }
    };
}

module.exports = new Translation();