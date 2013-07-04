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

describe('piwikVersion model integration', function() {

    it('should fetch the correct piwik version from demo.piwik.org', function() {

        var versionNumber = null;
        var version = Alloy.createModel('piwikVersion');
        version.fetch({
            account: getFakeAccount(),
            success : function(model) {
                versionNumber = model.getVersion(); // eg "1.12"
            }
        });

        waitsFor(function() {
            return (null !== versionNumber);
        }, 'Loading Piwik version never completed', 10000);

        runs(function() {
            var isValidResponse = parseFloat(versionNumber) > 1.11;
            expect(isValidResponse).toEqual(true);
        });
    });
});

describe('piwikVersion model', function() {
    var piwikVersion = null;

    beforeEach(function() {
        piwikVersion = Alloy.createModel('piwikVersion');
    });

    it('should be able to detect whether response is a valid response', function() {
        expect(piwikVersion.validResponse({value: '1.12'})).toBeTruthy();
        expect(piwikVersion.validResponse({value: null})).toBeTruthy();
        expect(piwikVersion.validResponse({})).toBeFalsy();
        expect(piwikVersion.validResponse([])).toBeFalsy();
        expect(piwikVersion.validResponse(null)).toBeFalsy();
    });
});

})();