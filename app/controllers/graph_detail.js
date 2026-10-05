/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var args = arguments[0] || {};

var reportName = args.reportName || ' ';
var reportDate = args.reportDate || ' ';
var isTablet = require('alloy').isTablet;

$.graph = $.graphWidget.getView();

var graphSwitcher = Alloy.createController('graph_switcher', args);
graphSwitcher.addSwitchGraph(true);
$.index.add(graphSwitcher.getView());

graphSwitcher.on('close', close);

graphSwitcher.on('switch', function () {
    renderIfPossibleAndNeeded();
});

$.index.addEventListener('click', function () {
    if (!graphSwitcher) {
        return;
    }
    
    graphSwitcher.toggleVisibility();
});

/**
 * Gets the width of the window.
 * 
 * @returns {int} The width in px 
 */
function getViewWidth() {
    if ($.index && $.index.size && $.index.size.width) {
        return $.index.size.width;
    }

    return Ti.Platform.displayCaps.platformWidth;
}

/**
 * Gets the height of the window.
 * 
 * @returns {int} The height in px 
 */
function getViewHeight() {
    return $.graphWidget.getHeight();
}

function renderIfPossibleAndNeeded()
{
    if (!$.graphWidget) {
        return;
    }

    var pictureWidth     = $.graphWidget.getWidth();
    var pictureHeight    = $.graphWidget.getHeight();
    if (!pictureWidth || !pictureHeight) {
        return;
    }

    var graphUrlWithSize = getGraphUrlWithSize(pictureWidth, pictureHeight);

    $.graphWidget.off('postlayout', renderIfPossibleAndNeeded);

    $.graphWidget.loadImage(graphUrlWithSize);
}


/**
 * Gets the graph url for the given width and height.
 * 
 * @returns {string}  The url to request the graph.
 */
function getGraphUrlWithSize(width, height) {

    if (!graphSwitcher.currentGraphUrl()) {
        
        return '';
    }

    var graph            = require('Piwik/PiwikGraph');
    var graphUrlWithSize = graph.appendSize(graphSwitcher.currentGraphUrl(), width, height, true);

    var params = {showMetricTitle: 1, showLegend: 1, legendAppendMetric: 1};
    if (isTablet) {
        params.backgroundColor = 'ffffff';
    }

    graphUrlWithSize = graph.setParams(graphUrlWithSize, params);
    graph = null;
    
    return graphUrlWithSize;
}

/**
 * Gets the image view for the given url, width and height.
 * 
 * @returns {Ti.UI.ImageView}  The created ImageView instance.
 */
function getImageView(url, width, height) {

    console.debug('matomo graphUrl is ' + url, 'graphdetail::getImageView');

    var options = {width: width,
                   height: height,
                   touchEnabled: false,
                   canScale: !OS_ANDROID,
                   hires: !OS_ANDROID,
                   defaultImage: '/images/graphdefault.png',
                   enableZoomControls: false,
                   image: url};

    return Alloy.createWidget('org.piwik.imageview', 'widget', options);
}


if (isTablet) {

    var quarter = Math.floor(getViewHeight() / 4);
    $.topContainer.height = quarter;
    $.bottomContainer.top = quarter;

    if (args.reportName) {
        $.reportName.text = '' + reportName;
    }
    
    if (args.reportDate) {
        $.reportDate.text = '' + reportDate;
    }

} else {


    function rotateImageOnAndroid (event) {

        try {
            var width = $.graphWidget.getWidth();
            var height = $.graphWidget.getHeight();

            $.index.remove($.graph);
            $.graph = null;

            if ($.graphWidget) {
                $.graphWidget.destroy();
                $.graphWidget = null;
            }

            var graphUrlWithSize = getGraphUrlWithSize(width, height);
            $.graphWidget        = getImageView(graphUrlWithSize, width, height);
            $.graph              = $.graphWidget.getView();

            $.graphWidget.setParent($.index);

        } catch (e) {
            console.warn('Failed to update (remove and add) graph', 'graphdetail');
            console.warn(e, 'graphdetail');
        }
    }

    Ti.Gesture.addEventListener('orientationchange', rotateImageOnAndroid);
}

function trackWindowRequest()
{
    require('Piwik/Tracker').setCustomVariable(1, 'reportName', reportName, 'page');

    require('Piwik/Tracker').trackWindow('Graph Detail', 'graph/detail');
}

function onOpen()
{
    trackWindowRequest();
}

function destroy()
{
    if (!isTablet) {
        Ti.Gesture.removeEventListener('orientationchange', rotateImageOnAndroid);
    }
}

function close()
{
    require('layout').close($.index);
}

function open()
{
    require('layout').open($.index);
    if (isTablet) {
        $.index.left = 0;
    }
}

exports.open = open;
