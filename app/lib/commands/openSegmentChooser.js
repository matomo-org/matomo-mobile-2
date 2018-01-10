/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

// see #4064 http://dev.piwik.org/trac/ticket/4064
var isOpened = false;

function fetchAllSegments(params, onSegmentChosenCallback)
{
    var segments = Alloy.createController('segments_chooser', {
        source: params.source ? params.source : null
    });

    if (onSegmentChosenCallback) {
        segments.on('segmentChosen', onSegmentChosenCallback);
    }

    segments.on('close', function () {
        isOpened = false;
    });

    segments.on('segmentChosen', function () {
        this.off('segmentChosen');
        this.close();
    });

    segments.open();
}

exports.execute = function (idSite, callback)
{
    if (isOpened) {
        return;
    }

    isOpened = !OS_IOS;

    fetchAllSegments(idSite, callback);
};