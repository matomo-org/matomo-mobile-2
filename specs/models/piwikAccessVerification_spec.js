/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var Alloy = require('alloy');

function getValidAccount()
{
    return require('specs/utils/account').getValidAccount();
}

function getInvalidAccount()
{
    return require('specs/utils/account').getInvalidAccount();
}

function expectAccessTokenToBe(account, valid)
{
    var done = false;
    var site = Alloy.createCollection('piwikAccessVerification');

    site.fetch({
        account: account,
        success: function (siteCollection) {
            done = true;
        }
    });

    waitsFor(function() {
        return done;
    }, 'Loading piwikAccessVerification never completed', 10000);

    runs(function() {
        expect(site.hasAccessToAtLeastOneWebsite()).toEqual(valid);
    });
}

describe('piwikAccessVerification Collection integration', function() {

    it('should have access to at least one website when authToken is valid', function() {

        expectAccessTokenToBe(getValidAccount(), true);

    });

    it('should not have access to any website when authToken is invalid', function() {

        expectAccessTokenToBe(getInvalidAccount(), false);

    });
});