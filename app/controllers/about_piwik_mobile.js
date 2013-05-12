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
    require('commands/openLink').execute('https://github.com/piwik/piwik-mobile');
}

function participate()
{
    require('commands/openLink').execute('http://piwik.org/contribute/');
}

function openLicense()
{
    var params  = {title: 'Piwik Mobile License', url: 'http://piwik.org/free-software/mobile/'};
    var license = Alloy.createController('webview', params);
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