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
 * @class    The module contains a few methods for querying device locale information.
 * 
 * @static
 */
function Locale () {

    /**
     * Available languages.
     * This list should be updated every time a new language is released to piwik. We could also automatically fetch a
     * list of all available languages via api before releasing a new version. But not each language is supported/works
     * on each platform. We have to test each new language before adding it.
     *
     * @type  Object
     *
     * Object ( [code] => [language name] )
     *
     * @constant
     */
    this.AVAILABLE_LANGUAGES = {
        be:         'Беларуская',
        bg:         'Български',
        ca:         'Català',
        cs:         'Česky',
        cy:         'Cymraeg', 
        da:         'Dansk',
        de:         'Deutsch',
        el:         'Ελληνικά',
        en:         'English',
        es:         'Español',
        et:         'Eesti keel',
        eu:         'Euskara',
        fa:         '\u0641\u0627\u0631\u0633\u06cc',
        fi:         'Suomi',
        fr:         'Français',
        gl:         'Galego',
        hr:         'Hrvatski',
        hu:         'Magyar',
        id:         'Bahasa Indonesia',
        it:         'Italiano',
        is:         '\u00cdslenska',
        ja:         '日本語',
        ko:         '한국어',
        lt:         'Lietuvių',
        lv:         'Latvie\u0161u',
        nb:         'Norsk (bokmål)',
        nl:         'Nederlands',
        nn:         'Nynorsk',
        pl:         'Polski',
        'pt-br':    'Português brasileiro',
        pt:         'Português',
        ro:         'Română',
        ru:         'Русский',
        sk:         'Slovensky',
        sq:         'Shqip',
        sr:         'Srpski',
        sv:         'Svenska',
        tr:         'Türkçe',
        uk:         'Українська',
        'zh-cn':    '简体中文',
        'zh-tw':    '台灣語'
    };

    // these languages are not supported / don't work on android
    if (OS_IOS) {
        this.AVAILABLE_LANGUAGES.ar = '\u0627\u0644\u0639\u0631\u0628\u064a\u0629';
        this.AVAILABLE_LANGUAGES.ka = '\u10e5\u10d0\u10e0\u10d7\u10e3\u10da\u10d8';
        this.AVAILABLE_LANGUAGES.he = '\u05e2\u05d1\u05e8\u05d9\u05ea';
        this.AVAILABLE_LANGUAGES.te = '\u0c24\u0c46\u0c32\u0c41\u0c17\u0c41';
        this.AVAILABLE_LANGUAGES.th = 'ไทย';
    }

    // see http://dev.piwik.org/trac/ticket/4008
    if (OS_MOBILEWEB) {
        this.AVAILABLE_LANGUAGES = {
            de: 'Deutsch',
            en: 'English',
            es: 'Español',
            fr: 'Français',
            it: 'Italiano',
            ja: '日本語',
        };
    }

    /**
     * Returns a map of all available/supported languages.
     *
     * @returns  {Object}  All available languages
     */
    this.getAvailableLanguages = function () {

        return this.AVAILABLE_LANGUAGES;
    };

    /**
     * Verifies whether the given language exists.
     * 
     * @param    {string}  lang  A language key, for example 'de' or 'en'
     *
     * @returns  {boolen}  True if the given language exists/is valid, false otherwise.
     */
    this.languageExists = function (lang) {
        return (this.AVAILABLE_LANGUAGES && this.AVAILABLE_LANGUAGES[lang]);
    };

    /**
     * Returns the chosen locale or the platform locale if not already one chosen.
     *
     * @returns  {string}  The locale, for example 'de' or 'en'.
     */
    this.getLocale = function () {

        var settings = Alloy.createCollection('AppSettings').settings();
        var locale   = settings.languageCode();

        if (locale && this.languageExists(locale)) {
            settings = null;

            return locale;
        }

        locale = this.getPlatformLocale();
        locale = locale.toLowerCase();

        if (!this.languageExists(locale)) {
            // use default lang
            locale = require('alloy').CFG.settings.locale;
        }

        settings.setLanguageCode(locale);

        return locale;
    };

    /**
     * Queries the platform/device locale or a default value if the platform locale is not readable.
     *
     * @returns  {string}  The platform locale, for example 'en'.
     */
    this.getPlatformLocale = function () {

        if (Ti.Platform.locale) {

            var locale = Ti.Platform.locale;
            
            if (locale && locale.getCurrentLocale) {
                // mobile web
                return locale.getCurrentLocale();
            }

            if (locale && locale.substr) {

                // some devices return for example "de-de". we just want the first two characters
                return locale.substr(0, 2).toLowerCase();
            }

            return locale;
        }

        return 'en';
    };
}

module.exports = new Locale();
