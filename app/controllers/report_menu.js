var options = null;

function refreshWebsiteButton()
{
    if (options.websiteName) {
        $.websiteContainer.show();
        $.websiteLabel.text = options.websiteName;
    } else {
        $.websiteContainer.hide();
    }
}

function refreshDateButton()
{
    if (options.prettyDate) {
        $.dateContainer.show();
        $.dateLabel.text = options.prettyDate;
    } else {
        $.dateContainer.hide();
    }
}

function refresh(opts)
{
    options = opts;

    refreshWebsiteButton();
    refreshDateButton();
}

function onClose()
{
    $.destroy();
}

function chooseWebsite()
{
    require('layout').hideRightSidebar();
    require('commands/openWebsiteChooser').execute(onWebsiteChosen);
}

function onWebsiteChosen(event)
{
    require('session').setWebsite(event.site, event.account);
}

function chooseDate()
{
    require('layout').hideRightSidebar();

    var params = {date: options.reportDate, period: options.reportPeriod};
    require('commands/openDateChooser').execute(params, onDateChosen);
}

function onDateChosen(event)
{
    $.trigger('dateChosen', event);
}

function open()
{
    require('layout').setRightSidebar($.index);
}

function toggleVisibility() 
{
    require('layout').toggleRightSidebar();
}

exports.open    = open;
exports.refresh = refresh
exports.toggleVisibility = toggleVisibility;