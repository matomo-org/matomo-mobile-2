var args = arguments[0] || {};

if (OS_IOS || OS_ANDROID) {
    $.title.text = args.title || '';
} else {
    $.index.headerTitle = args.title || '';
}