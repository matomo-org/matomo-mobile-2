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

describe('piwikVersion model', function() {

    it.eventually('should fetch the correct piwik version from demo.piwik.org', function(done) {

        var version = Alloy.createModel('piwikVersion');
        version.fetch({
            account: getFakeAccount(),
            success : function(model) {
                var versionNumber   = model.getVersion(); // eg "1.12"
                var isValidResponse = parseFloat(versionNumber) > 1.11;

                expect(isValidResponse).toBe(true);
                done();

            }, error: function () {
                expect('Version number is greater than 1.11').toBe("");
                done();
            }
        });
    });
});