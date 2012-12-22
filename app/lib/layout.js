exports.bootstrap = function(controller)
{
    var alloy = require('alloy');

    if (OS_IOS && alloy.isHandheld) {
        alloy.Globals.layout = require('layout/iphone');
        alloy.Globals.layout.bootstrap(controller);

    } else if (OS_IOS && alloy.isTablet) {

        alloy.Globals.layout = require('layout/ipad');
        alloy.Globals.layout.bootstrap(controller);

    } else if (OS_MOBILEWEB) {

        alloy.Globals.layout = require('layout/mobileweb');
        alloy.Globals.layout.bootstrap(controller);

    } else if (OS_ANDROID) {
        alloy.Globals.layout = require('layout/android');
        alloy.Globals.layout.bootstrap(controller);
    }
}