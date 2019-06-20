/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var moment = require('moment/moment');

function isLoadedByDefault(locale)
{
    return ('en' == locale);
}

function tryToLoadLanguage(locale)
{
    if (isLoadedByDefault(locale)) {
        return true;
    }

    var path = 'moment/lang/' + locale;

    try {
        var lang = require(path);

        return locale == moment.lang();
        
    } catch (e) {
        console.log('failed to load moment language: ' + locale);
    }
}

function tryToLoadLanguageBasedOnLocale()
{
    var locale  = require('Piwik/Locale');

    var success = tryToLoadLanguage(locale.getLocale());

    if (!success) {
        tryToLoadLanguage(locale.getPlatformLocale());
    }
}

tryToLoadLanguageBasedOnLocale();

exports.getPrettyDate = function (reportDate) {
    if (!reportDate) {
        return '';
    }

    var rangeDates = reportDate.getRangeDate();
    var fromDate   = rangeDates[0];
    var toDate     = rangeDates[1];

    // TODO I know we should avoid a switch and make a class for each type
    switch (reportDate.getPeriod()) {
        case 'day':
            return moment(fromDate).format('LL');

        case 'week':
            var period = require('L')('Intl_PeriodWeek');
            var formattedFromDate = moment(fromDate).format('ll');
            var formattedToDate   = moment(toDate).format('ll');

            return String.format('%s %s - %s', period, formattedFromDate, formattedToDate);

        case 'month':
            return moment(fromDate).format('MMMM YYYY');

        case 'year':
            return moment(fromDate).format('YYYY');

        case 'range':
            return String.format('%s - %s', moment(fromDate).format('ll'), moment(toDate).format('ll'));
    }

    return '';
};