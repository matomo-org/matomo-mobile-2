
if (readPathToI18nDirFromCommandLineArgument()) {
    updateTranslationsForAllAvailableLanguages();
} else {
    console.log('please add parameter to i18n dir. For instance "./updatelanguagefiles ../../../app/lib/i18n/"');
}

function updateTranslationsForAllAvailableLanguages(callback)
{
    getPiwikClient().api({
      method:   'LanguagesManager.getAvailableLanguages',
      languageCode: 'en',
      period:   'day',
      date:     'today'
    }, onAllAvailableLanguagesFetched);
}

function getPiwikClient()
{
    var PiwikClient = require('piwik-client');
    return new PiwikClient('https://demo.matomo.org', 'anonymous');
}

function onAllAvailableLanguagesFetched(err, languages)
{
    if (err) {
        console.log(err);
        return;
    }

    var interval = 2000;
    var delay    = interval;

    for (var index = 0; index < languages.length; index++) {
        var languageCode = languages[index];

        setTimeout((function (languageCode) {
            return function () {
                updateTranslationForLanguageCode(languageCode);
            };
        })(languageCode), delay);

        delay+=interval;
    }
}

function updateTranslationForLanguageCode(languageCode)
{
    console.log('fetching translations for language: ' + languageCode);

    getPiwikClient().api({
      method:   'LanguagesManager.getTranslationsForLanguage',
      languageCode: languageCode,
      filter_limit: '-1',
      period:   'day',
      date:     'today'
    }, function (err, translations) {
        onTranslationsForLanguageCodeFetched(err, translations, languageCode);
    });
}

function onTranslationsForLanguageCodeFetched(err, translations, languageCode)
{
    if (err) {
        console.log(err);
        return;
    }

    var neededKeys = getAllTranslationKeysUsedInMobileApp();
    var foundKeys = {};

    for (var index = 0; index < translations.length; index++) {
        var translation    = translations[index];
        var translationKey = translation.label;

        if (translationKey && neededKeys[translationKey]) {
            foundKeys[translationKey] = unicodeEscape(translation.value);
        }
    }

    writeTranslationKeysToFile(languageCode, foundKeys);
}

function getAllTranslationKeysUsedInMobileApp()
{
    return require(getPathToI18nDir() + 'default.js');
}

function getPathToI18nDir()
{
    return readPathToI18nDirFromCommandLineArgument();
}

function readPathToI18nDirFromCommandLineArgument()
{
    if (process.argv[2]) {
        return process.argv[2];
    }
}

function unicodeEscape(str) {
  return str.replace(/[^A-Za-z0-9]/g, function (escape) {
    return '\\u' + ('0000' + escape.charCodeAt().toString(16)).slice(-4);
  });
}

function writeTranslationKeysToFile(languageCode, translations)
{
    if (!languageCode) {
        return;
    }

    var header = ['/**', ' * Matomo - Open source web analytics', ' *', ' * @link https://matomo.org',
                  ' * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later', ' */', ''];

    var content = header.join('\n') + 'module.exports = ' + JSON.stringify(translations) + ';';
    content     = content.replace(/\\\\/g,'\\');
    var path    = getPathToI18nDir() + languageCode + '.js';

    var fs = require('fs');
    fs.writeFile(path, content, function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log('translations for language ' + languageCode + ' written');
        }
    }); 
}

function log(message)
{
    require('sys').debug(message);
}