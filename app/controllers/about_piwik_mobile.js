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

function followPiwik()
{
    require('commands/openLink').execute('https://www.twitter.com/matomo_org');
}

function openLicense()
{
    var url = 'https://www.gnu.org/licenses/gpl-3.0.html';

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
