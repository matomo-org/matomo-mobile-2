/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
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

    require('Piwik/Tracker').trackEvent({name: 'Toggle Report Chooser', category: 'Give Feedback'});
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
    var version = require('Piwik').getAppVersion();

    return String.format("%s - %s %s", 
                         '' + version,
                         '' + Ti.version, 
                         '' + Ti.buildHash);
}

function doSendEmailFeedback()
{
    require('commands/sendEmailFeedback').execute();

    require('Piwik/Tracker').trackEvent({name: 'Email Us', category: 'Give Feedback'});
}

function doRateApp()
{
    require('commands/rateApp').execute();

    require('Piwik/Tracker').trackEvent({name: 'Rate-App', category: 'Give Feedback'});
}

function doParticipate()
{
    require('commands/openLink').execute('https://matomo.org/get-involved/');
}

function createRow(params)
{
    return Alloy.createWidget('org.piwik.tableviewrow', null, params).getRow();
}

function createNonSelectableRow(params)
{
    var row = createRow(params);

    if (OS_IOS) {
        row.selectionStyle = Ti.UI.iOS.TableViewCellSelectionStyle.NONE;
    } else {
        row.backgroundSelectedColor = '#ffffff';
    }

    return row;
}

function createSelectableRow(params)
{
    var row = createRow(params);

    if (OS_IOS) {
        row.selectionStyle = Ti.UI.iOS.TableViewCellSelectionStyle.GRAY;
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
            description: 'Matomo Mobile App is a Free Software, we would really appreciate if you took 1 minute to rate us.'
        });
        row.addEventListener('click', doRateApp);
        rows.push(row);
    }

    if (!OS_IOS) {
	    row = createSelectableRow({
	        title: 'Learn how you can participate', 
	        description: 'Matomo is a project made by the community, you can participate in the Matomo Mobile App or Matomo.'
	    });
	    row.addEventListener('click', doParticipate);
	    rows.push(row);
    }

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