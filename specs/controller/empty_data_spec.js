/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var Alloy = require('alloy');

describe('empty data controller', function() {

    it('should display the passed message and title', function() {

        var emptyData = Alloy.createController('empty_data', {message: 'Test message', title: 'Test Title'});

        expect(emptyData.message.text).toEqual('Test message');
        expect(emptyData.title.text).toEqual('Test Title');
    });
});