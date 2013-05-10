var args = arguments[0] || {};

if (OS_IOS && args.style && 'native' == args.style) {

    exports.getSection = function () 
    {
        var params = {headerTitle: String(args.title)};

        return Ti.UI.createTableViewSection(params);
    }

} else {

    $.title.text = args.title || '';

    exports.getSection = function ()
    {
        return $.index;
    }
}