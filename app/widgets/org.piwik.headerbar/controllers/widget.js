/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var widthOfActionBarItem = 0;

function addActionBarItem(actionBarItem, index)
{
    if (!actionBarItem || !actionBarItem.icon) {
        return;
    }

    var item = Ti.UI.createImageView({
        image: actionBarItem.icon, 
        top: '8dp',
        width: '32dp', 
        height: '32dp',
        left: '8dp',
        right: '8dp',
        backgroundSelectedColor: '#a9a9a9',
    });

    item.addEventListener('click', function (event) {
        event.cancelBubble = true;
        $.trigger('actionItem' + index)
    });

    $.actionButtons.add(item);
    widthOfActionBarItem += 48;
}

function setHomeIcon(image)
{
    $.homeIcon.backgroundImage = image;
    $.homeIcon.backgroundSelectedColor = '#a9a9a9';
}

function setDefaultHomeIcon()
{
    setHomeIcon('/appicon.png');
}

function setTitle(title)
{
    $.headerTitle.text = title || '';
}

function syncWidthOfTitleAndActionBar()
{
    $.headerTitle.right = widthOfActionBarItem + 'dp';
}

function enableBackButton() 
{
    $.backangle.backgroundImage = '/back.png';
    $.backangle.backgroundSelectedColor = '#a9a9a9';

    $.backangle.addEventListener('click', function (event) {
        event.cancelBubble = true;
        $.trigger('back');
    });

    $.homeIcon.addEventListener('click', function (event) {
        event.cancelBubble = true;
        $.trigger('back');
    });
}

function applyCustomProperties(args)
{
    if (args.homeIcon) {
        setHomeIcon(args.homeIcon);
    } else {
        setDefaultHomeIcon();
    }

    if (args.actionItem1) {
        addActionBarItem(args.actionItem1, 1);
    }

    if (args.canGoBack) {
        enableBackButton();
    }

    syncWidthOfTitleAndActionBar();
    setTitle(args.title);
}

applyCustomProperties(arguments[0] || {});

$.homeIcon.addEventListener('click',function (event) {
    event.cancelBubble = true;
    $.trigger('homeIconItemSelected');
});

exports.setTitle = setTitle;
exports.resetHomeIcon = setDefaultHomeIcon;
exports.enableCanGoBack = enableBackButton;