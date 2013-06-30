/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var Alloy = require('alloy');

function createController(options)
{
    return Alloy.createController('empty_data', options);
}

function expectedMessageToBeEqual(controller, message)
{
    expect(controller.message.text).toEqual(message);
}

function expectedTitleToBeEqual(controller, message)
{
    expect(controller.title.text).toEqual(message);
}

describe('empty data controller', function() {

    it('should use a default title but no default message', function() {

        var emptyData = createController();

        expectedTitleToBeEqual(emptyData, require('L')('Mobile_NoDataShort'));
        expectedMessageToBeEqual(emptyData, null);
    });

    it('should display the passed message and title', function() {

        var emptyData = createController({message: 'Test message', title: 'Test Title'});

        expectedTitleToBeEqual(emptyData, 'Test Title');
        expectedMessageToBeEqual(emptyData, 'Test message');
    });
});