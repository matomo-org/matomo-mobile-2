/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

(function () {

var Alloy = require('alloy');

function getFakeAccount()
{
    return require('specs/utils/account').getValidAccount();
}

function getFakeWebsite()
{
    return {"label":"virtual-drums.com","nb_visits":37,"nb_actions":64,"nb_pageviews":64,"revenue":null,"visits_evolution":"0%","actions_evolution":"-3%","pageviews_evolution":"-3%","idsite":3};
}

function loadFixture(collection, fixture)
{
    var parsedData = collection.parse(fixture, {});

    collection.reset(parsedData, {});
}

function getFixtures()
{
    return require('specs/fixtures/piwikWebsites');
}

function getMultipleWebsites()
{
    return getFixtures().getMultipleWebsites();
}

function expectNumberOfReturnedWebsites(params, numWebsitesExpectec)
{
    var entrySiteCollection = Alloy.createCollection('piwikWebsites');
    entrySiteCollection.fetch({
        params: params,
        account: getFakeAccount()
    });

    waitsFor(function() {
        return !!entrySiteCollection.length;
    }, 'Loading webites never completed', 10000);

    runs(function() {
        expect(entrySiteCollection.length).toEqual(numWebsitesExpectec);
    });
}

describe('piwikWebsites Collection integration', function() {

    it('should fetch all websites that belong to a account', function() {

        expectNumberOfReturnedWebsites({}, 3);
    });

    it('should fetch only a limited number of websites if a limit is set', function() {

        expectNumberOfReturnedWebsites({filter_limit: 1}, 1);
    });
});

describe('piwikWebsites Collection', function() {
    var piwikWebsites = null;

    beforeEach(function() {
        piwikWebsites = Alloy.createCollection('piwikWebsites');
    });

    it('should detect the number of available websites', function() {
        loadFixture(piwikWebsites, getMultipleWebsites());

        expect(piwikWebsites.length).toEqual(3);
    });

    it('should be able to detect whether it has websites', function() {
        loadFixture(piwikWebsites, getMultipleWebsites());
        expect(piwikWebsites.hasWebsites()).toBeTruthy();

        loadFixture(piwikWebsites, []);
        expect(piwikWebsites.hasWebsites()).toBeFalsy();
    });

    it('should be able to detect whether response is a valid response', function() {
        expect(piwikWebsites.validResponse(getMultipleWebsites())).toBeTruthy();
        expect(piwikWebsites.validResponse([])).toBeTruthy();
        expect(piwikWebsites.validResponse({})).toBeFalsy();
    });
});

describe('piwikWebsites model', function() {

    it('should return website properties', function() {

        var website = Alloy.createModel('piwikWebsites', getFakeWebsite());

        expect(website.getName()).toEqual('virtual-drums.com');
        expect(website.getSiteId()).toEqual(3);
        expect(website.id).toEqual(3);
    });
});

})();