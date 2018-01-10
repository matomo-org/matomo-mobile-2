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
    require('Piwik/Tracker').trackWindow('Help', 'help');
}

function onClose()
{
    $.destroy();
    $.off();
}

function openFaq()
{
    require('commands/openFaq').execute();
}

function openAboutPiwikMobile()
{
    var about = Alloy.createController('about_piwik_mobile');
    about.open();
}

function emailUs()
{
    require('commands/sendEmailFeedback').execute();

    require('Piwik/Tracker').trackEvent({name: 'Email Us', category: 'Help'});
}

function openForum()
{
    require('commands/openLink').execute('https://forum.matomo.org/');
}

function openMarketplace()
{
    require('commands/openLink').execute('https://plugins.matomo.org/');
}

function openDocumentation()
{
    require('commands/openLink').execute('https://matomo.org/docs/');
}

function toggleReportChooserVisibility(event)
{
    require('report/chooser').toggleVisibility();

    require('Piwik/Tracker').trackEvent({name: 'Toggle Report Chooser', category: 'Help'});
}

exports.close = function ()
{
    require('layout').close($.index);
};

exports.open = function() 
{
    require('layout').open($.index);
};