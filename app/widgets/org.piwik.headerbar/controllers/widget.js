/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var widthOfActionBarItem = 0;

function addActionBarItem(actionBarItem, index)
{
    if (!actionBarItem || !actionBarItem.icon) {
        return;
    }

    var view = Ti.UI.createView({
        width: '56dp',
        height: '56dp',
        backgroundSelectedColor: '#2e4893'
    });

    var item = Ti.UI.createImageView({
        image: actionBarItem.icon,
        width: '24dp',
        height: '24dp',
        left: '16dp'
    });

    view.addEventListener('click', function (event) {
        event.cancelBubble = true;
        $.trigger('actionItem' + index);
    });

    view.add(item);

    $.actionButtons.add(view);
    widthOfActionBarItem += 56;
}

function setTitle(title)
{
    $.headerTitle.text = title || '';
}

function syncWidthOfTitleAndActionBar()
{
    $.headerTitle.right = widthOfActionBarItem + 'dp';
}

function setBackAngleImage(image)
{
    $.homeIcon.backgroundImage = image;
    $.backButton.backgroundSelectedColor = '#2e4893';
}

function enableBackButton() 
{
    setBackAngleImage('/images/ic_arrow_back_white_24dp.png');

    try {
        $.backButton.removeEventListener('click', onHomeItemSelected);
    } catch (e) {}

    function onBack(event)
    {
        event.cancelBubble = true;
        $.trigger('back');
    }
    
    $.backButton.addEventListener('click', onBack);
}

function showNavigationDrawer()
{
    setBackAngleImage('/images/ic_menu_white_24dp.png');
}

function applyCustomProperties(args)
{
    if (args.actionItem1) {
        addActionBarItem(args.actionItem1, 1);
    }

    if (args.hasNavigation) {
        showNavigationDrawer();
    }

    if (args.canGoBack) {
        enableBackButton();
    }

    syncWidthOfTitleAndActionBar();
    setTitle(args.title);
}

function onHomeItemSelected(event) {
    event.cancelBubble = true;
    $.trigger('homeItemSelected');
}

applyCustomProperties(arguments[0] || {});

$.backButton.addEventListener('click', onHomeItemSelected);

exports.setTitle = setTitle;
exports.enableCanGoBack = enableBackButton;
