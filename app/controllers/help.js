function L(key)
{
    return require('L')(key);
}

function onClose()
{
    $.destroy();
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
}

function openForum()
{
    var params = {title: L('General_Forums'), url: 'http://forum.piwik.org/'};
    Alloy.createController('webview', params).open();
}

function openDocumentation()
{
    var params = {title: L('General_Documentation'), url: 'http://piwik.org/docs/'};
    Alloy.createController('webview', params).open();
}

function toggleReportChooserVisibility(event)
{
    require('report/chooser').toggleVisibility();
}

exports.close = function ()
{
    require('layout').close($.index);
};

exports.open = function() 
{
    require('layout').open($.index);
};