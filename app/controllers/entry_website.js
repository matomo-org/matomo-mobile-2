/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var args    = arguments[0] || {};
var account = args.account;
var emptyData = new (require('ui/emptydata'));

function L(key, substitution)
{
    var translation = require('L')(key);

    if (substitution) {
        return String.format(translation, L(substitution));
    }

    return translation;
}

function onOpen()
{
    require('Piwik/Tracker').trackWindow('Open Entry Website', 'fetch-entry-website');

    fetchEntrySite();
}

function onClose()
{
    emptyData && emptyData.cleanupIfNeeded();
    account = null;
    $.destroy();
    $.off();
}

function chooseAccount()
{
    require('Piwik/Tracker').trackEvent({name: 'Choose Account', category: 'Entry Website'});

    var accounts = Alloy.createController('accounts_selector');
    accounts.on('accountChosen', onAccountChosen);
    accounts.open();
}

function onAccountChosen(accountModel)
{
    require('Piwik/Tracker').trackEvent({name: 'Account Chosen', action: 'result', category: 'Entry Website'});

    $.trigger('accountChosen', accountModel);
    $.close();
}

function onWebsiteChosen(websiteModel)
{
    $.trigger('websiteLoaded', {site: websiteModel, account: account});
    $.close();
}

function fetchEntrySite()
{
    if (!account) {
        console.warn('Cannot open entry site, no account given', 'account');
        return;
    }

    showLoadingMessage();

    var entrySiteId = account.entrySiteId();
    var site        = Alloy.createCollection('PiwikWebsitesById');
    site.fetch({
        params: {idSite: entrySiteId},
        account: account,
        success: function (sites) {
            if (!sites) {
                console.warn('Failed to fetch entry site', 'account');
                return;
            }

            onWebsiteChosen(sites.entrySite());
        },
        error: function (undefined, error) {
            if (error && error.getError) {

                showErrorMessage(error.getError(), error.getMessage());
            }
        }
    });
}

function showLoadingMessage()
{
    $.loading.show();
    $.loading.visible = true;
}

function showErrorMessage(title, message)
{
    emptyData.show($.index, fetchEntrySite, title, message);

    $.loading.hide();
    $.loading.visible = false;
}

exports.close = function ()
{
    require('layout').close($.index, false);
};

exports.open = function ()
{
    require('layout').open($.index, false);
};
