var args = arguments[0] || {};

$.title.text = args.title;
$.value.text = args.value;

if (args.hasChild) {
    $.index.hasChild = true;
}

exports.changeTitle = function (title)
{
    $.title.text = title;
}

exports.changeValue = function (value)
{
    $.value.text = value;
}