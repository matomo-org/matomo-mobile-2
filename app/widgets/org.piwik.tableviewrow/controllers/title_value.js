var args = arguments[0] || {};

$.title.text = args.title;
$.value.text = args.value;

if (args.hasChild) {
    $.index.hasChild = true;
}