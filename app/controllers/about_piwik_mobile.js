function L(key)
{
    return require('L')(key);
}

function openWebsite()
{
    require('commands/openLink').execute('http://piwik.org');
}

function followPiwik()
{
    require('commands/openLink').execute('https://www.twitter.com/piwik');
}

function openSourceCode()
{
    require('commands/openLink').execute('http://dev.piwik.org/svn/mobile');
}

function participate()
{
    require('commands/openLink').execute('http://piwik.org/contribute/');
}

function openLicense()
{
    var license = Alloy.createController('license');
    license.open();
}

function onClose()
{
    $.destroy();
}

function close() 
{
    require('layout').close($.index);
}

exports.open = function() 
{
    require('layout').open($.index);
};