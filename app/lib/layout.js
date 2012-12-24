var layoutName = '';
var alloy      = require('alloy');

if (OS_IOS && alloy.isHandheld) {
    layoutName = 'layout/iphone';
} else if (OS_IOS && alloy.isTablet) {
    layoutName = 'layout/ipad';
} else if (OS_MOBILEWEB) {
    layoutName = 'layout/mobileweb';
} else if (OS_ANDROID) {
    layoutName = 'layout/android';
}

exports = require(layoutName);