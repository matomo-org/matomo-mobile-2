/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function L(key)
{
    return require('L')(key);
}

var session = require('session');
session.on('websiteChanged', resetSegment);

function chooseSegment()
{
    if (!isAnAccountSelected()) {
        return;
    }

    var params = {};

    if (Alloy.isTablet && OS_IOS) {
        params.source = $.index;
    }

    require('commands/openSegmentChooser').execute(params, onSegmentChosen);

    $.trigger('selected', {});
}

function onSegmentChosen(event)
{
    if (!event) {
        return;
    }

    updateSegment(event.segment);
}

function isAnAccountSelected()
{
    return !!session.getAccount();
}

function updateSegment(segment) {
    if (!segment) {
        resetSegment();
        return;
    }

    updateSegmentName(segment.getName());
    session.setSegment(segment);
}

function resetSegment(segment) {
    updateSegmentName(L('SegmentEditor_DefaultAllVisits'));
    session.resetSegment();
}

function updateSegmentName(segmentName) {
    $.segmentName.text = segmentName;
}


resetSegment();