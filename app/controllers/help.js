function L(key)
{
    return require('L')(key);
}

function onClose()
{
    $.destroy();
}

function doOpenFaq()
{
    require('commands/openFaq').execute();
}

function doOpenAboutPiwikMobile()
{
    var about = Alloy.createController('about_piwik_mobile');
    about.open();
}

function doOpenGiveFeedback()
{
    var feedback = Alloy.createController('give_feedback');
    feedback.open();
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