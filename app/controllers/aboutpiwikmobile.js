function L(key)
{
    return require('L')(key);
}

function doOpenWebsite()
{
    require('commands/openLink').execute('http://piwik.org');
}

function doEmailUs()
{
    require('commands/sendEmailFeedback').execute();
}

function doFollowPiwik()
{
    require('commands/openLink').execute('https://www.twitter.com/piwik');
}

function doOpenSourceCode()
{
    require('commands/openLink').execute('http://dev.piwik.org/svn/mobile');
}

function doOpenLicense()
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