exports.hide = function()
{
    if (!OS_IOS) {
        $.loading.hide();
    }
}

exports.show = function()
{
    if (!OS_IOS) {
        $.loading.show();
    }
}