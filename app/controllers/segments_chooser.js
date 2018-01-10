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

var args = arguments[0] || {};
var popoverSource = args.source || null;

var emptyData = new (require('ui/emptydata'));
$.piwikSegments.on('reset', render);
$.piwikSegments.on('error', function (undefined, error) {
    if (error) {
        showMessageNoSegmentsFound(error.getError(), error.getMessage());
    }
});

function onOpen()
{
    require('Piwik/Tracker').trackWindow('Segment Chooser', 'segment-chooser');
}

function onClose()
{
    emptyData && emptyData.cleanupIfNeeded();

    if ($.piwikSegments) {
        $.piwikSegments.abortRunningRequests();
        $.piwikSegments.off('reset', render);
    }

    if (OS_ANDROID && $.segmentsTable) {
        // prevent tableViewRows from leaking memory
        $.segmentsTable.setData([]);
    }

    $.trigger('close');

    $.destroy();
    $.off();
}

function segmentChosen(segmentModel)
{
    $.trigger('segmentChosen', {segment: segmentModel});
}

function selectSegment(event)
{
    if (!event || !event.row || !_.has(event.row, 'modelid')) {
        console.log('ModelID not defined, cannot select segment');
        return;
    }

    var id = event.row.modelid;
    var siteModel = $.piwikSegments.get(id);

    if (!siteModel) {
        console.log('segmentsModel not found in collection, cannot select segment');
        return;
    }
    
    segmentChosen(siteModel);
}

function render()
{
    /** This should be done by segments model */
    var model = Alloy.createModel('piwikSegments', {
        idsegment: '-1',
        name: L('SegmentEditor_DefaultAllVisits'),
        definition: ''
    });
    model.save();

    $.piwikSegments.unshift(model);
    /** This should be done by segments model */

    showReportContent();

    var rows = [];
    $.piwikSegments.forEach(function (segment) {
        var rowOptions = {
            classes: [],
            title: segment.getName(),
            modelid: segment.getIdSegment()
        };
        rows.push($.UI.create('TableViewRow', rowOptions));
    });

    $.segmentsTable.setData(rows);
    rows = [];
}

function showReportContent()
{
    $.content.show();
    $.content.visible = true;
    $.loading.hide();
    $.loading.visible = false;
    emptyData && emptyData.cleanupIfNeeded();
}

function showLoadingMessage()
{
    $.loading.show();
}

function refresh()
{
    fetchListOfAvailableSegments();
}

function showMessageNoSegmentsFound(title, message)
{
    emptyData.show($.indexWin ? $.indexWin : $.index, refresh, title, message);

    $.loading.hide();
    $.loading.visible = false;
    $.content.hide();
    $.content.visible = false;
}

function fetchListOfAvailableSegments()
{
    showLoadingMessage();

    var website = require('session').getWebsite();
    var account = require('session').getAccount();

    $.piwikSegments.fetchSegments({
        account: account,
        params: {
            idSite: website.getSiteId(),
            showColumns: 'idsegment,name,definition'
        }
    });
}

function closeWindow()
{
    if (OS_IOS && Alloy.isTablet) {
        $.index.hide();
    } else if (OS_IOS) {
        $.index.close();
    } else {

        if (OS_ANDROID && $.segmentsTable) {
            // this prevents leaking tableViewRows
            $.segmentsTable.setData([]);
        }

        require('layout').close($.index);
    }
}

exports.close = closeWindow;

exports.open = function () {

    if (OS_IOS && Alloy.isTablet) {
        $.index.show({view: popoverSource});
    } else if (OS_IOS) {
        $.index.open({modal: true});
    } else {
        require('layout').open($.index);
    }

    fetchListOfAvailableSegments();
};
