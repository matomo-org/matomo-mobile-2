/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

require('behave').andSetup(this);
var Alloy = require('alloy');

function getFakeAccount()
{
    return require('specs/utils/account').getValidAccount();
}

function getFakeWebsite()
{
    return {"label":"virtual-drums.com","nb_visits":37,"nb_actions":64,"nb_pageviews":64,"revenue":null,"visits_evolution":"0%","actions_evolution":"-3%","pageviews_evolution":"-3%","idsite":3};
}

function expectNumberOfReturnedWebsites(params, numWebsitesExpectec, done)
{
    var entrySiteCollection = Alloy.createCollection('piwikWebsites');
    entrySiteCollection.fetch({
        params: params,
        account: getFakeAccount(),
        success: function (entrySiteCollection) {

            expect(entrySiteCollection.length).toBe(numWebsitesExpectec);
            done();

        }, error: function () {
            expect('Fetches websites a user has access to').toBe('');
            done();
        }
    });
}

describe('piwikWebsites Collection', function() {

    it.eventually('should fetch all websites that belong to a account', function(done) {

        expectNumberOfReturnedWebsites({}, 3, done);
    });

    it.eventually('should fetch only a limited number of websites if a limit is set', function(done) {

        expectNumberOfReturnedWebsites({filter_limit: 1}, 1, done);
    });
});

describe('piwikWebsites model', function() {

    it('should return website properties', function() {

        var website = Alloy.createModel('piwikWebsites', getFakeWebsite());

        expect(website.getName()).toBe('virtual-drums.com');
        expect(website.getSiteId()).toBe(3);
        expect(website.id).toBe(3);
    });
});