var args = arguments[0] || {};

$.title.text = args.title;
delete args.title;

$.index.applyProperties(args);