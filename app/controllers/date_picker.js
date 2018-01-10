/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var session = require('session');
session.on('reportDateChanged', updateDisplayedDate);

function chooseDate()
{
    var reportDate = session.getReportDate();

    var period = reportDate ? reportDate.getPeriodQueryString() : 'day';
    var date   = reportDate ? reportDate.getDateQueryString() : 'today';
    var params = {date: date, period: period};

    if (Alloy.isTablet && OS_IOS) {
        params.source = $.index;
    }

    require('commands/openDateChooser').execute(params, onDateChosen);

    $.trigger('selected', {});
}

function onDateChosen(period, date)
{
    var reportDate = new (require('report/date'));
    reportDate.setPeriod(period);
    reportDate.setDate(date);

    session.setReportDate(reportDate);
}

function updateDisplayedDate(reportDate)
{
    var dateFormatter = require('date/formatter');
    $.dateLabel.text  = dateFormatter ? dateFormatter.getPrettyDate(reportDate) : '';
}

updateDisplayedDate(session.getReportDate());