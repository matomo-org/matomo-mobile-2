function L(key)
{
    return require('L')(key);
}

function openWebsite()
{
    var params = {title: 'Piwik', url: 'http://piwik.org/'};
    Alloy.createController('webview', params).open();
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
    var params = {title: 'Contribute', url: 'http://piwik.org/contribute/'};
    Alloy.createController('webview', params).open();
}

function openLicense()
{
    var params  = {title: 'Piwik Mobile License', url: 'http://piwik.org/free-software/mobile/'};
    var license = Alloy.createController('webview', params);
    license.open();
}

function onOpen()
{
    require('Piwik/Tracker').trackWindow('About Piwik Mobile', 'about-piwik-mobile');
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