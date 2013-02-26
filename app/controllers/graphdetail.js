var args = arguments[0] || {};

var reportName = args.reportName || ' ';
var reportDate = args.reportDate || ' ';

$.graph = $.graphWidget.getView();

var graphSwitcher = Alloy.createController('graphswitcher', args);
graphSwitcher.addSwitchGraph(true);
$.index.add(graphSwitcher.getView());

graphSwitcher.on('close', function () {
    require('layout').close($.index);
});

graphSwitcher.on('switch', function () {
    $.graph.image = getGraphUrlWithSize(getPictureWidth(), getPictureHeight());
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
    return ($.index.size && $.index.size.width) ? $.index.size.width : Ti.Platform.displayCaps.platformWidth;
}

/**
 * Gets the height of the window.
 * 
 * @returns {int} The height in px 
 */
function getViewHeight() {
    return ($.index.size && $.index.size.height) ? $.index.size.height : Ti.Platform.displayCaps.platformHeight;
}

/**
 * Gets the calculated width of the graph.
 * 
 * @returns {int} The width in px 
 */
function getPictureWidth() {
    return getViewWidth() - 20; // 10px space top and bottom
}

/**
 * Gets the calculated height of the graph.
 * 
 * @returns {int} The height in px 
 */
function getPictureHeight() {
    var height        = getViewHeight();
    var pictureHeight = 0;
    
    if (require('alloy').isTablet) {
        pictureHeight = height -  Math.floor(height / 4) - 20; // 75% - 20px (10px space top and bottom)
    } else {
        pictureHeight = height - 20; // 10px space left and right
    }
    
    return pictureHeight;
}

var navBarHeight = Ti.Platform.displayCaps.platformHeight - getViewHeight();

/**
 * Gets the calculated width of the graph after a window orientation change on Android. We have to detect 
 * current width/height cause 'this.size' is not correct after an orientation change.
 * 
 * @returns {int} The width in px 
 */
function getOrientationSpecificWidth() {
    var pictureWidth = Ti.Platform.displayCaps.platformWidth - navBarHeight - 20;
    
    return pictureWidth;
};

/**
 * Gets the calculated height of the graph after a window orientation change on Android. We have to detect 
 * current width/height cause 'this.size' is not correct after an orientation change.
 * 
 * @returns {int} The height in px 
 */
function getOrientationSpecificHeight() {
    var pictureHeight = Ti.Platform.displayCaps.platformHeight - navBarHeight - 20;
    
    return pictureHeight;
};

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
    graphUrlWithSize     = graph.setParams(graphUrlWithSize, {showMetricTitle: 1, legendAppendMetric: 1});
    graph                = null;
    
    return graphUrlWithSize;
}

/**
 * Gets the image view for the given url, width and height.
 * 
 * @returns {Ti.UI.ImageView}  The created ImageView instance.
 */
function getImageView(url, width, height) {

    console.log('piwik graphUrl is ' + url, 'graphdetail::getImageView');

    var options = {width: width,
                   height: height,
                   touchEnabled: false,
                   canScale: !OS_ANDROID,
                   hires: !OS_ANDROID,
                   defaultImage: '/images/graphDefault.png',
                   enableZoomControls: false,
                   image: url};

    return Alloy.createWidget('org.piwik.imageview', 'widget', options);
}

var pictureWidth     = getPictureWidth();
var pictureHeight    = getPictureHeight();
var graphUrlWithSize = getGraphUrlWithSize(pictureWidth, pictureHeight);

$.graph.image = graphUrlWithSize;

if (require('alloy').isTablet) {

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
            var pictureWidth  = getOrientationSpecificWidth();
            var pictureHeight = getOrientationSpecificHeight();
            
            $.index.remove($.graph);
            $.graph = null;

            if ($.graphWidget) {
                $.graphWidget.destroy();
                $.graphWidget = null;
            }

            var graphUrlWithSize = getGraphUrlWithSize(pictureWidth, pictureHeight);
            $.graphWidget        = getImageView(graphUrlWithSize, pictureWidth, pictureHeight);
            $.graph              = $.graphWidget.getView();

            $.graphWidget.setParent($.index);
            
       //    $.index.add($.graph);
            
        } catch (e) {
            console.warn('Failed to update (remove and add) graph', 'graphdetail');
            console.warn(e, 'graphdetail');
            for (var ind in e) {
                console.log(ind, e[ind]);
            }
        }
    }
    
    function rotateImage (event) {

        var pictureWidth  = getPictureWidth();
        var pictureHeight = getPictureHeight();

        $.graph.width   = pictureWidth;
        $.graph.height  = pictureHeight;

        $.graph.image   = getGraphUrlWithSize(pictureWidth, pictureHeight);
    }

    Ti.Gesture.addEventListener('orientationchange', OS_ANDROID ? rotateImageOnAndroid : rotateImage);
}

function destroy()
{
    if (!require('alloy').isTablet) {
        Ti.Gesture.removeEventListener('orientationchange', OS_ANDROID ? rotateImageOnAndroid : rotateImage);
    }
}

exports.open = function () 
{
    require('layout').open($.index);
}