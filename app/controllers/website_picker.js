var session = require('session');
session.on('websiteChanged', updateWebsiteName);

function chooseWebsite()
{
    require('layout').hideLeftSidebar();
    require('commands/openWebsiteChooser').execute(onWebsiteChosen);
}

function onWebsiteChosen(event)
{
    session.setWebsite(event.site, event.account);
}

function updateWebsiteName(siteModel) {
    $.websiteName.text = siteModel.getName();
}

updateWebsiteName(session.getWebsite());