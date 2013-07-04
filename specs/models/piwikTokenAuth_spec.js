/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

(function () {

var Alloy = require('alloy');

function getValidAccount()
{
    return require('specs/utils/account').getValidAccount();
}

describe('piwikTokenAuth Model integration', function() {
    var tokenAuth = null;

    beforeEach(function() {
        tokenAuth = Alloy.createModel('piwikTokenAuth');
    });

    it('should return anonymous token if no username and password is given', function() {

        tokenAuth.fetchToken(getValidAccount(), '', '', function () {}, function () {});

        expect(tokenAuth.getTokenAuth()).toEqual('anonymous');
    });

    it('should return an AuthToken even if username and password combination is wrong', function() {

        var collection = null;

        tokenAuth.fetchToken(getValidAccount(), 'test', '1', function (coll) { collection = coll; }, function () {});

        waitsFor(function() {
            return null !== collection;
        }, 'Loading piwikTokenAuth never completed', 10000);

        runs(function() {
            expect(tokenAuth.getTokenAuth()).toEqual('222150f554573ef40101d202a7cdd99d');
            expect(collection).toEqual(tokenAuth);
        });
    });

    it('should pass the collection to the success callback', function() {

        var collection = null;
        tokenAuth.fetchToken(getValidAccount(), '', '', function (coll) { collection = coll; }, function () {});

        expect(collection).toEqual(tokenAuth);
    });

    it('should be able to generate password md5 hash', function() {

        expect(tokenAuth.getPasswordHash('1')).toEqual('c4ca4238a0b923820dcc509a6f75849b');
    });

    it('should be able to detect whether response is a valid response', function() {
        expect(tokenAuth.validResponse({value: 'any'})).toBeTruthy();
        expect(tokenAuth.validResponse({value: null})).toBeTruthy();
        expect(tokenAuth.validResponse({})).toBeFalsy();
        expect(tokenAuth.validResponse([])).toBeFalsy();
        expect(tokenAuth.validResponse(null)).toBeFalsy();
    });
});

})();