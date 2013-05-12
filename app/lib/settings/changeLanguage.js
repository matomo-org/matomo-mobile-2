var L = require('L');
var Alloy = require('alloy');

function availableLanguages() 
{
    var locale = require('Piwik/Locale');
    
    return locale.getAvailableLanguages();
}

function currentLanguageName() 
{
    var languages = availableLanguages();
    var settings  = Alloy.createCollection('AppSettings').settings();
            
    var currentLanguageCode = settings.languageCode();
    var currentLanguage     = 'English';

    for (var langCode in languages) {

        if (currentLanguageCode && currentLanguageCode == langCode) {
            currentLanguage = languages[langCode];
        }
    }

    return currentLanguage;
}

function availableLanguageNames()
{
    var languages = availableLanguages();
    // an array like ['English', 'German', ...]
    var languageNames   = [];

    // languages: an object like {en: 'English', de: 'German', ...}
    for (var langCode in languages) {
        languageNames.push(languages[langCode]);
    }

    return languageNames;
}

function availableLanguageNamesSortedByAlphabet()
{
    var languages = availableLanguageNames();
    languages.sort();

    return languages;
}

function currentSelectedLanguageIndex() 
{
    var availableLanguages = availableLanguageNamesSortedByAlphabet();
    var currentLanguage    = currentLanguageName();

    // detect current selected language index so we are able to preselect it later...
    var currentLangIndex     = null;
    for (var index in availableLanguages) {
        if (currentLanguage && availableLanguages[index] == currentLanguage) {
            currentLangIndex = index;
            break;
        }
    }

    return currentLangIndex;
}

function getLanguageCodeByIndex(selectedLanguageIndex)
{
    var languages     = availableLanguages();
    var languageNames = availableLanguageNamesSortedByAlphabet();
    for (var langCode in languages) {
        if (languageNames[selectedLanguageIndex] == languages[langCode]) {

            return langCode;
        }
    }
}

function trackLanguageChange(selectedLangCode)
{
    var tracker = require('Piwik/Tracker');
    tracker.trackEvent({title: 'Language Changed',
                        url: '/settings/changed/language/' + selectedLangCode});
}

function changeLanguageSetting(selectedLangCode)
{
    var settings = Alloy.createCollection('AppSettings').settings();
    settings.setLanguageCode(selectedLangCode);
    settings.save();
}

function pressedCancel(event)
{
    // android reports cancel = true whereas iOS returns the previous defined cancel index
    return (!event || event.cancel === event.index || true === event.cancel);
}

function onLanguageSelected (event) 
{
    if (pressedCancel(event)) {

        return;
    }

    // user selected same value as already selected
    if (event.index == currentSelectedLanguageIndex()) {

        return;
    }
    
    var selectedLangCode = getLanguageCodeByIndex(event.index);

    if (selectedLangCode) {
        trackLanguageChange(selectedLangCode);
        changeLanguageSetting(selectedLangCode);
    }
}

exports.getCurrentLanguageName = currentLanguageName;
exports.open = function (appSettings) {

    var languageNames = availableLanguageNamesSortedByAlphabet();
    languageNames.push(L('SitesManager_Cancel_js'));

    var langDialog = Ti.UI.createOptionDialog({
        title: L('General_ChooseLanguage'),
        options: languageNames,
        cancel: (languageNames.length - 1)
    });

    var currentLangIndex = currentSelectedLanguageIndex();
    if (null !== currentLangIndex) {
        langDialog.selectedIndex = currentLangIndex;
    }

    langDialog.addEventListener('click', onLanguageSelected);

    langDialog.show();
    langDialog = null;
};