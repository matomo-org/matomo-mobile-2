var args = arguments[0] || {};
var reportData      = args.data || false;
var reportMetadata  = args.metadata || false;
var sortOrderColumn = args.sortOrderColumn || false;

$.title.text = reportData.label;
$.value.text = reportData[sortOrderColumn];