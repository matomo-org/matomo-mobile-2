/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var session = require('session');
session.on('websiteChanged', updateWebsiteName);

function chooseWebsite()
{
    if (!isAnAccountSelected()) {
        return;
    }
    
    require('commands/openWebsiteChooser').execute(onWebsiteChosen);

    $.trigger('selected', {});
}

function onWebsiteChosen(event)
{
    if (!event) {
        return;
    }
    
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