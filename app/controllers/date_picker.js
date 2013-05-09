var session = require('session');
session.on('reportDateChanged', updateDisplayedDate);

function chooseDate()
{
    $.trigger('selected', {});

    var reportDate = session.getReportDate();
    var period = reportDate.getPeriodQueryString();
    var date   = reportDate.getDateQueryString();

    var params = {date: date, period: period};
    require('commands/openDateChooser').execute(params, onDateChosen);
}

function onDateChosen(period, date)
{
    console.log(period, date);
    var reportDate = new (require('report/date'));
    reportDate.setPeriod(period);
    reportDate.setDate(date);

    session.setReportDate(reportDate);
}

function updateDisplayedDate(reportDate)
{
    var dateFormatter = require('date/formatter');
    $.dateLabel.text  = dateFormatter.getPrettyDate(reportDate);
}

updateDisplayedDate(session.getReportDate());