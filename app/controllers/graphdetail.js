var args = arguments[0] || {};

$.graph.image = args.graphUrl;

exports.open = function () 
{
    require('layout').open($.index);
}