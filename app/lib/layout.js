exports.bootstrap = function(detailViewController, masterViewController)
{
    var alloy = require('alloy');

    if (OS_IOS && alloy.isHandheld) {
        alloy.Globals.layout = require('layout/iphone');
        alloy.Globals.layout.bootstrap(detailViewController);

    } else if (OS_IOS && alloy.isTablet) {

        alloy.Globals.layout = require('layout/ipad');
        alloy.Globals.layout.bootstrap(detailViewController, masterViewController);

    } else if (OS_MOBILEWEB) {

        alloy.Globals.layout = require('layout/mobileweb');
        alloy.Globals.layout.bootstrap(detailViewController);

    } else if (OS_ANDROID) {
        alloy.Globals.layout = require('layout/android');
        alloy.Globals.layout.bootstrap(detailViewController);
    }
}