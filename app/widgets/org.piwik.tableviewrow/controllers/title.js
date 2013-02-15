var args = arguments[0] || {};

$.title.text = args.title;

if (args.hasChild) {
    $.index.hasChild = true;
}