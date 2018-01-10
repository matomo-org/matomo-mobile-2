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

function openWebsite()
{
    require('commands/openLink').execute('https://matomo.org/');
}

function followPiwik()
{
    require('commands/openLink').execute('https://www.twitter.com/matomo_org');
}

function openSourceCode()
{
    require('commands/openLink').execute('https://github.com/matomo-org/matomo-mobile-2');
}

function openIssues()
{
    require('commands/openLink').execute('https://github.com/matomo-org/matomo-mobile-2/issues');
}

function participate()
{
    require('commands/openLink').execute('https://matomo.org/get-involved/');
}

function openLicense()
{
    var url = 'https://matomo.org/free-software/mobile/';

    if (OS_IOS) {
        url = 'https://www.gnu.org/licenses/gpl-3.0.html';
    }

    require('commands/openLink').execute(url);
}

function onOpen()
{
    require('Piwik/Tracker').trackWindow('About Matomo Mobile', 'about-piwik-mobile');
}

function onClose()
{
    $.destroy();
    $.off();
}

function close() 
{
    require('layout').close($.index);
}

exports.open = function() 
{
    require('layout').open($.index);
};