/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

require('behave').andSetup(this);

function getFakeAccount()
{
    return require('specs/utils/account').getValidAccount();
}

function getFakeWebsite()
{
    return {"idsite":"3","name":"virtual-drums.com","main_url":"http:\/\/www.virtual-drums.com","ts_created":"2008-01-27 01:41:53","timezone":"UTC","currency":"USD","excluded_ips":"","excluded_parameters":"","excluded_user_agents":"","sitesearch":"1","sitesearch_keyword_parameters":"","sitesearch_category_parameters":"","group":"","keep_url_fragment":"0","ecommerce":"0"};
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

        expectNumberOfReturnedWebsites({limit: 1}, 1, done);
    });
});

describe('piwikWebsites model', function() {

    it('should return website properties', function() {

        var website = Alloy.createModel('piwikWebsites', getFakeWebsite());

        expect(website.getName()).toBe('virtual-drums.com');
        expect(website.getSiteId()).toBe(3);
        expect(website.id).toBe('3');
    });
});