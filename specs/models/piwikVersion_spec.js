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

function createPiwikVersionModel(version)
{
    return Alloy.createModel('piwikVersion', {value: version});
}

function expectVersionToBeRestritedCompatible(version, isRestricted)
{
    var model = createPiwikVersionModel(version);
    expect(model.isRestrictedCompatible()).toEqual(isRestricted);
}

function expectVersionToBeFullyCompatible(version, isCompatible)
{
    var model = createPiwikVersionModel(version);
    expect(model.isFullyCompatible()).toEqual(isCompatible);
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
        piwik1Dot1Version = Alloy.createModel('piwikVersion', {value: '1.11.1'});
        piwik1Dot1Version = Alloy.createModel('piwikVersion', {value: '1.12'});
        piwik1Dot1Version = Alloy.createModel('piwikVersion', {value: '2.0'});
    });

    it('should be able to detect whether response is a valid response', function() {
        expect(piwikVersion.validResponse({value: '1.12'})).toBeTruthy();
        expect(piwikVersion.validResponse({value: null})).toBeTruthy();
        expect(piwikVersion.validResponse({})).toBeFalsy();
        expect(piwikVersion.validResponse([])).toBeFalsy();
        expect(piwikVersion.validResponse(null)).toBeFalsy();
    });

    it('should be a restricted version in case Piwik version is 1.12', function() {
        expectVersionToBeRestritedCompatible(null, false);
        expectVersionToBeRestritedCompatible(undefined, false);
        expectVersionToBeRestritedCompatible('', false);
        
        expectVersionToBeRestritedCompatible('1.11', false);
        expectVersionToBeRestritedCompatible('1.11.3', false);
        expectVersionToBeRestritedCompatible('2.0', false);
        expectVersionToBeRestritedCompatible('2.0.0', false);
        expectVersionToBeRestritedCompatible('2.12.0', false);
        
        expectVersionToBeRestritedCompatible('1.12', true);
        expectVersionToBeRestritedCompatible('1.12.0', true);
        expectVersionToBeRestritedCompatible('1.12.1', true);
        expectVersionToBeRestritedCompatible('1.12-beta', true);
    });
    
    it('should be a fully compatible version in case Piwik version is 2.0', function() {
        expectVersionToBeFullyCompatible(null, false);
        expectVersionToBeFullyCompatible(undefined, false);
        expectVersionToBeFullyCompatible('', false);
        
        expectVersionToBeFullyCompatible('1.11', false);
        expectVersionToBeFullyCompatible('1.12', false);
        expectVersionToBeFullyCompatible('1.12.0', false);
        expectVersionToBeFullyCompatible('1.12.1', false);
        expectVersionToBeFullyCompatible('1.12-beta', false);
        
        expectVersionToBeFullyCompatible('2.0', true);
        expectVersionToBeFullyCompatible('2.0.0', true);
        expectVersionToBeFullyCompatible('2.12.0', true);
        expectVersionToBeFullyCompatible('2.0-a1', true);
    });
});

})();