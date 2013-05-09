function L(key)
{
    return require('L')(key);
}

function onClose()
{
    $.destroy();
}

function toggleReportChooserVisibility(event)
{
    require('report/chooser').toggleVisibility();
}

function platformInfo()
{
    return String.format('%s %s %s (%s)', 
                         '' + Ti.Platform.name, 
                         '' + Ti.Platform.version, 
                         '' + Ti.Platform.model, 
                         '' + Ti.Platform.locale);
}

function versionInfo()
{
    return String.format("%s - %s %s", 
                         '' + Ti.App.version, 
                         '' + Ti.version, 
                         '' + Ti.buildHash);
}

function doSendEmailFeedback()
{
    require('commands/sendEmailFeedback').execute();
}

function doRateApp()
{
    require('commands/rateApp').execute();
}

function doParticipate()
{
    require('commands/openLink').execute('http://piwik.org/contribute/');
}

function createRow(params)
{
    return Alloy.createWidget('org.piwik.tableviewrow', null, params).getRow();
}

function createSection(params)
{
    return Alloy.createWidget('org.piwik.tableviewsection', null, params).getSection();
}

function render()
{
    var rows = [];

    var row = createRow({
        title: 'Email Us', 
        description: 'Send us fedback, report a bug or a feature wish.'
    });
    row.addEventListener('click', doSendEmailFeedback);
    rows.push(row);

    var appRating = new (require('Piwik/App/Rating'));
    if (appRating.canRate()) {
        row = createRow({
            title: 'Rate us on the App Store', 
            description: 'Piwik Mobile App is a Free Software, we would really appreciate if you took 1 minute to rate us.'
        });
        row.addEventListener('click', doRateApp);
        rows.push(row);
    }

    row = createRow({
        title: 'Learn how you can participate', 
        description: 'Piwik is a project made by the community, you can participate in the Piwik Mobile App or Piwik.'
    });
    row.addEventListener('click', doParticipate);
    rows.push(row);

    rows.push(createSection({title: 'About', style: 'native'}));
    rows.push(createRow({title: 'Version', description: versionInfo()}));
    rows.push(createRow({title: 'Platform', description: platformInfo()}));

    $.feedbackTable.setData(rows);
    rows = null;
    row  = null;
}

exports.open = function () {
    render();
    require('layout').open($.index);
};

exports.close = function () {
    require('layout').close($.index);
};