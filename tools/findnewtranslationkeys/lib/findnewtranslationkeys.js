if (readPathToI18nDirFromCommandLineArgument()) {
    fetchEnglishTranslation();
} else {
    console.log('please add parameter to i18n dir. For instance "./updatelanguagefiles ../../../app/lib/i18n/"');
}

function getPiwikClient()
{
    var PiwikClient = require('piwik-client');
    return new PiwikClient('https://demo.matomo.org', 'anonymous');
}

function fetchEnglishTranslation()
{
    console.log('fetching translations for language: en');

    getPiwikClient().api({
        method:   'LanguagesManager.getTranslationsForLanguage',
        languageCode: 'en'
    }, function (err, translations) {
        onEnglishTranslationFetched(err, translations, 'en');
    });
}

function foundInTranslations(translationKeyToSearch, translations)
{
    for (var index = 0; index < translations.length; index++) {
        var translation    = translations[index];
        var translationKey = translation.label;

        if (translationKey == translationKeyToSearch) {
            return true;
        }
    }

    return false;
}

function onEnglishTranslationFetched(err, translations, languageCode)
{
    if (err) {
        console.log(err);
        return;
    }

    outputNewTranslationKeys(findNewTranslationKeys(translations));
}

function findNewTranslationKeys(translations)
{
    var usedKeys = getAllTranslationKeysUsedInMobileApp();
    var newKeys = [];

    for (var usedTranslationKey in usedKeys) {
        if (usedKeys.hasOwnProperty(usedTranslationKey) && !foundInTranslations(usedTranslationKey, translations)) {
            newKeys.push(usedTranslationKey + ':\t\t\t ' + usedKeys[usedTranslationKey]);
        }
    }

    return newKeys;
}

function outputNewTranslationKeys(potentiallyNewTranslationKeys)
{
    console.warn('Potentially new translation keys: \n' + potentiallyNewTranslationKeys.join('\n'));
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

    return '';
}

function log(message)
{
    require('sys').debug(message);
}