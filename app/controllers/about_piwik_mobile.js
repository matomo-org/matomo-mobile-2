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

function openWebsite()
{
    require('commands/openLink').execute('https://piwik.org/');
}

function followPiwik()
{
    require('commands/openLink').execute('https://www.twitter.com/piwik');
}

function openSourceCode()
{
    require('commands/openLink').execute('https://github.com/piwik/piwik-mobile-2');
}

function openIssues()
{
    require('commands/openLink').execute('https://github.com/piwik/piwik-mobile-2/issues');
}

function participate()
{
    require('commands/openLink').execute('https://piwik.org/contribute/');
}

function openLicense()
{
    var url = 'https://piwik.org/free-software/mobile/';

    if (OS_IOS) {
        url = 'https://www.gnu.org/licenses/gpl-3.0.html';
    }

    require('commands/openLink').execute(url);
}

function onOpen()
{
    require('Piwik/Tracker').trackWindow('About Piwik Mobile', 'about-piwik-mobile');
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