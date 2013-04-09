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
    var about = Alloy.createController('aboutpiwikmobile');
    about.open();
}

function doOpenGiveFeedback()
{
    var feedback = Alloy.createController('givefeedback');
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