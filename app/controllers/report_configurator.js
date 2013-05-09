function onClose()
{
    $.destroy();
}

function hideRightSidebar () {
    require('layout').hideRightSidebar();
}

function open()
{
    require('layout').setRightSidebar($.index);
}

function toggleVisibility() 
{
    require('layout').toggleRightSidebar();
}

exports.open = open;
exports.toggleVisibility = toggleVisibility;