function L(key)
{
    return require('L')(key);
}

function onClose()
{
    $.destroy();
}

exports.open = function () {
    require('layout').open($.index);
}