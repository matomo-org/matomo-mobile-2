var session = require('session');
session.on('websiteChanged', updateWebsiteName);

function chooseWebsite()
{
    if (!isAnAccountSelected()) {
        return;
    }
    
    $.trigger('selected', {});

    require('commands/openWebsiteChooser').execute(onWebsiteChosen);
}

function onWebsiteChosen(event)
{
    session.setWebsite(event.site, event.account);
}

function isAnAccountSelected()
{
    return !!session.getAccount();
}

function updateWebsiteName(siteModel) {
    $.websiteName.text = siteModel ? siteModel.getName() : '';
}

updateWebsiteName(session.getWebsite());