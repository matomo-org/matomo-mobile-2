/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function L(key)
{
    return require('L')(key);
}

function onOpen()
{
    require('Piwik/Tracker').trackWindow('Give Feedback', 'give-feedback');
}

function onClose()
{
    $.destroy();
    $.off();
}

function toggleReportChooserVisibility(event)
{
    require('report/chooser').toggleVisibility();

    require('Piwik/Tracker').trackEvent({title: 'Toggle Report Chooser', url: '/give-feedback/toggle/report-chooser'});
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

    require('Piwik/Tracker').trackEvent({title: 'Email Us', url: '/give-feedback/email-us'});
}

function doRateApp()
{
    require('commands/rateApp').execute();

    require('Piwik/Tracker').trackEvent({title: 'Rate-App', url: '/give-feedback/rate-app'});
}

function doParticipate()
{
    require('commands/openLink').execute('http://piwik.org/contribute/');
}

function createRow(params)
{
    return Alloy.createWidget('org.piwik.tableviewrow', null, params).getRow();
}

function createNonSelectableRow(params)
{
    var row = createRow(params);

    if (OS_IOS) {
        row.selectionStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.NONE;
    } else {
        row.backgroundSelectedColor = '#ffffff';
    }

    return row;
}

function createSelectableRow(params)
{
    var row = createRow(params);

    if (OS_IOS) {
        row.selectionStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY;
    } else {
        row.backgroundSelectedColor = '#dcdcdc';
    }

    return row;
}

function createSection(params)
{
    return Alloy.createWidget('org.piwik.tableviewsection', null, params).getSection();
}

function render()
{
    var rows = [];

    var row = createSelectableRow({
        title: 'Email Us', 
        description: 'Send us feedback, report a bug or a feature wish.'
    });
    row.addEventListener('click', doSendEmailFeedback);
    rows.push(row);

    var appRating = new (require('Piwik/App/Rating'));
    if (appRating.canRate()) {
        row = createSelectableRow({
            title: 'Rate us on the App Store', 
            description: 'Piwik Mobile App is a Free Software, we would really appreciate if you took 1 minute to rate us.'
        });
        row.addEventListener('click', doRateApp);
        rows.push(row);
    }

    row = createSelectableRow({
        title: 'Learn how you can participate', 
        description: 'Piwik is a project made by the community, you can participate in the Piwik Mobile App or Piwik.'
    });
    row.addEventListener('click', doParticipate);
    rows.push(row);

    rows.push(createSection({title: 'About', style: 'native'}));
    rows.push(createNonSelectableRow({title: 'Version', description: versionInfo()}));
    rows.push(createNonSelectableRow({title: 'Platform', description: platformInfo()}));

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