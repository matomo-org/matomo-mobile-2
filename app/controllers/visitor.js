/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function L(key)
{
    return require('L')(key);
}

var args    = arguments[0] || {};
var visitor = args.visitor;

var accountModel = require('session').getAccount();
var accessUrl    = accountModel ? accountModel.getBasePath() : 'http://demo.piwik.org/';

var rows = [];

createOverview(visitor, accessUrl);
createCustomVariables(visitor, accessUrl);
createSystem(visitor, accessUrl);
createActionDetails(visitor, accessUrl);

$.visitorTable.setData(rows);
rows = null;

function open()
{
    require('layout').open($.index);
}

function close()
{
    require('layout').close($.index);
}

exports.open  = open;
exports.close = close;

function onOpen()
{
    require('Piwik/Tracker').trackWindow('Visitor Details', 'visitor-details');
}

function createRow(params)
{
    return Alloy.createWidget('org.piwik.tableviewrow', null, params).getRow();
}

function createSection(params)
{
    return Alloy.createWidget('org.piwik.tableviewsection', null, params).getSection();
}

function createFirstVisitTimeRow(visitor)
{
    var visitDateLabel = String.format('%s %s - (%s)', 
                                        '' + visitor.serverDatePrettyFirstAction,
                                        '' + visitor.serverTimePrettyFirstAction, 
                                        '' + visitor.visitDurationPretty);

    return createRow({title: visitDateLabel, className: 'visitorTableViewRow'});
}

function createOverview (visitor, accessUrl) 
{
    rows.push(createFirstVisitTimeRow(visitor));

    if (visitor.visitIp) {
        rows.push(createRow({title: L('General_VisitorIP'),
                             className: 'visitorTableViewRow',
                             value: visitor.visitIp}));
    }
    
    if (visitor.visitorType) {
        var visitorTypeText = visitor.visitorType;
        
        switch (visitorTypeText) {
            case 'new':
                visitorTypeText = L('General_NewVisitor');
                break;

            case 'returning':

                visitorTypeText = '' + visitor.visitorType;

                if (visitor.visitCount) {
                    var visits = '' + (parseInt(visitor.visitCount, 10));
                    visits     = String.format(L('VisitsSummary_NbVisits'), visits);

                    visitorTypeText += String.format(' (%s)', visits);
                }
                break;
        }

        rows.push(createRow({title: L('General_VisitType'),
                             className: 'visitorTableViewRow',
                             value: visitorTypeText}));
    }

    if (visitor.goalConversions) {
        var goalConversionsText = String.format(L('General_VisitConvertedNGoals'),
                                                '' + parseInt(visitor.goalConversions, 10));
        rows.push(createRow({title: goalConversionsText,
                             className: 'visitorTableViewRow'}));
    }

    // @todo display more information about the referrer
    var referrerValue = visitor.referrerName ? visitor.referrerName : visitor.referrerTypeName;

    if (referrerValue) {
        var referrerParams = {title: L('General_FromReferrer'),
                              className: 'visitorTableViewRow'};

        if (visitor.referrerUrl) {

            if (100 < visitor.referrerUrl.length) {
                referrerParams.description = visitor.referrerUrl.substr(0, 100) + '...';
            } else {
                referrerParams.description = visitor.referrerUrl;
            }

            // use vertical layout. Otherwise a long title will overlap the description (url).
            referrerParams.layout    = 'vertical';

            referrerParams.title    += ' ' + referrerValue;
            referrerParams.focusable = true;

        } else {
             // use value to display referrerValue if no url is given
             referrerParams.value = referrerValue;
        }

        if (visitor.referrerKeyword) {
            referrerParams.title += String.format(": '%s'", '' + visitor.referrerKeyword);
        }

        var referrerRow = createRow(referrerParams);

        referrerRow.addEventListener('click', function () {
            if (visitor.referrerUrl) {

                require('Piwik/Tracker').trackLink('/visitor/referrer-url', 'link');
                Ti.Platform.openURL(visitor.referrerUrl);
            }
        });

        rows.push(referrerRow);
        referrerRow = null;
    }

    if (visitor.country) {
        rows.push(createRow({title: L('UserCountry_Country'),
                             value: visitor.country,
                             className: 'visitorTableViewRow'}));
        // leftImage: {url: accessUrl + visitor.countryFlag}
    }
}

/**
 * Displays all custom variables of the user.
 * Output looks like:
 * <br />
 * Custom Variables<br />
 * $VARNAME     $VARVALUE<br />
 * $VARNAME     $VARVALUE<br />
 * $VARNAME     $VARVALUE<br />
 */
function createCustomVariables(visitor, accessUrl) {
    var _ = require('alloy/underscore')._;
    if (_.isEmpty(visitor.customVariables)) {

        return;
    }

    rows.push(createSection({title: L('CustomVariables_CustomVariables')}));

    for (var customVariableIndex in visitor.customVariables) {

        var customVariable      = visitor.customVariables[customVariableIndex];
        var customVariableName  = customVariable['customVariableName' + customVariableIndex];
        var customVariableValue = customVariable['customVariableValue' + customVariableIndex];

        rows.push(createRow({title: customVariableName,
                             className: 'visitorTableViewRow',
                             value: customVariableValue}));
    }
    
    visitor = null;
}

/**
 * Creates system information.
 * Output looks like:
 * <br />
 * System<br />
 * OS           $OPERATINGSYSTEM $OPERATINGSYSTEMICON<br />
 * Browser      $BROWSERNAME ($SCREENTYPE) $BROWSERICON<br />
 * Resolution   $RESOLUTION<br />
 * Plugins      $PLUGINICONS<br />
 */
function createSystem(visitor, accessUrl) {

    rows.push(createSection({title: L('UserSettings_VisitorSettings')}));

    if (visitor.operatingSystem) {
        rows.push(createRow({title: 'OS',
                             className: 'visitorTableViewRow',
                             value: visitor.operatingSystem}));
        // leftImage: {url: accessUrl + visitor.operatingSystemIcon}
    }

    if (visitor.browserName) {
        rows.push(createRow({title: L('UserSettings_ColumnBrowser'),
                             className: 'visitorTableViewRow',
                             value: visitor.browserName}));
        // leftImage: {url: accessUrl + visitor.browserIcon}
    }
    
    var resolution = visitor.resolution;
    if (resolution &&
        visitor.screenType &&
        'normal' != ('' + visitor.screenType).toLowerCase()) {
        resolution += String.format(' (%s)', ''+ visitor.screenType);
        // accessUrl + visitor.screenTypeIcon
    }

    if (resolution) {
        rows.push(createRow({title: L('UserSettings_ColumnResolution'),
                             className: 'visitorTableViewRow',
                             value: resolution}));
    }

    if (visitor.pluginsIcons && visitor.pluginsIcons.length && accessUrl) {

        var row = createRow({title: L('UserSettings_Plugins'), className: 'visitorTableViewRow'});

        var right = 10;
        for (var index = 0; index < visitor.pluginsIcons.length; index++) {
            var pluginIcon = visitor.pluginsIcons[index];

            // TODO not all icons are 14x14
            if (pluginIcon.pluginIcon) {
                row.add(Ti.UI.createImageView({image: accessUrl + pluginIcon.pluginIcon,
                                               right: OS_ANDROID ? (right + 'dp') : right,
                                               width: OS_ANDROID ? '14dp' : 14,
                                               height: OS_ANDROID ? '14dp' : 14, 
                                               top: OS_ANDROID ? '14dp' : 14,
                                               className: 'pluginIcon'}));
            }

            right +=28;
        }

        rows.push(row);
        row = null;
    }
    
    visitor = null;
}

/**
 * Triggers the rendering of several actions.
 */
function createActionDetails(visitor, accessUrl) {

    if (!visitor.actionDetails || !visitor.actionDetails.length) {
        visitor = null;

        return;
    }

    var numActions = parseInt(visitor.actions, 10);
    
    rows.push(createSection({title: String.format(L('VisitsSummary_NbActions'),
                             '' + numActions)}));

    for (var index = 0; index < visitor.actionDetails.length; index++) {
        var actionDetail = visitor.actionDetails[index];

        if (!actionDetail) {
            continue;
        }

        switch (actionDetail.type) {
            case 'action':
                createActionAction(actionDetail, visitor, accessUrl);
                break;

            case 'ecommerceOrder':
            case 'ecommerceAbandonedCart':
                createEcommerceAction(actionDetail, visitor, accessUrl);
                break;

            default:
                createDefaultAction(actionDetail, visitor, accessUrl);
                break;
        }
    }
    
    visitor = null;
}

/**
 * Renders the 'action' action.
 * Output looks like:
 * <br />
 * $PAGETITLE<br />
 * $URL<br />
 * $SERVERTIMEPRETTY<br />
 *
 * @param  {Object}  actionDetail
 */
function createActionAction(actionDetail) {

    var row = Ti.UI.createTableViewRow(helperVisitorActionActionTableViewRow());

    if (actionDetail.pageTitle) {
        row.add(Ti.UI.createLabel(helperVisitorActionActionPageTitleLabel(actionDetail.pageTitle)));
    }
    if (actionDetail.url) {
        row.add(Ti.UI.createLabel(helperVisitorActionActionUrlLabel(actionDetail.url)));
    }
    if (actionDetail.serverTimePretty) {
        row.add(Ti.UI.createLabel(helperVisitorActionActionServerTimeLabel(actionDetail.serverTimePretty)));
    }

    rows.push(row);
    row = null;
    actionDetail = null;
}

/**
 * Renders the 'default' action. For example 'outlink', 'goal' or 'download'.
 * Output looks like:
 * <br />
 * $ICON $TYPE<br />
 * $URL<br />
 *
 * @param  {Object}  actionDetail
 */
function createDefaultAction(actionDetail, visitor, accessUrl) {

    var row       = Ti.UI.createTableViewRow(helperVisitorActionDefaultTableViewRow());

    var view      = Ti.UI.createView(helperVisitorActionDefaultHeadlineView());

    if (accessUrl && actionDetail.icon) {
        view.add(Ti.UI.createImageView(helperVisitorActionDefaultIconImageView(accessUrl + actionDetail.icon)));
    }

    if (actionDetail.type) {

        var title = '' + actionDetail.type;

        switch (actionDetail.type) {
            case 'goal':
                title = L('General_Goal');
                break;
            
            case 'download':
                title = L('General_Download');
                break;

            case 'outlink':
                title = L('General_Outlink');
                break;

            case 'search':
                title = L('Actions_SubmenuSitesearch');
                break;
        }

        view.add(Ti.UI.createLabel(helperVisitorActionDefaultTypeLabel(title)));
    }

    row.add(view);
    view = null;

    if (actionDetail.url) {
        row.add(Ti.UI.createLabel(helperVisitorActionDefaultUrlLabel(actionDetail.url)));
    }

    rows.push(row);
    row          = null;
    actionDetail = null;
}

/**
 * Renders the 'default' action. For example 'outlink' or 'download'.
 * Output looks like:
 * <br />
 * $ICON Ecommerce Order/Abandoned art ($ORDERID)<br />
 * Revenue: $X $CURRENCY, Subtotal: $Y $CURRENCY, $ETC.<br />
 * List of Products (Quantity: $QUANTITY):<br />
 * * $PRODUCT NAME ($PRODUCT SKU), $PRODUCT_CATEGORY<br />
 * $PRICE $CURRENCY - Quantity: $QTY<br />
 * Product 2<br />
 * Product 3 etc.<br />
 *
 * @param  {Object}  actionDetail
 */
function createEcommerceAction(actionDetail, visitor, accessUrl) {

    var row           = Ti.UI.createTableViewRow(helperVisitorActionEcommerceTableViewRow());
    var ecommerceView = Ti.UI.createView(helperVisitorActionEcommerceHeadlineView());
    var ecommerceText = '';

    switch (actionDetail.type) {
        case 'ecommerceOrder':
            ecommerceText = L('Goals_EcommerceOrder');

            break;

        case 'ecommerceAbandonedCart':
            ecommerceText = L('Goals_AbandonedCart');

            break;

        default:
            ecommerceText = L('Goals_Ecommerce');
    }

    if (actionDetail.orderId) {
        ecommerceText = String.format('%s (%s)', '' + ecommerceText, '' + actionDetail.orderId);
    }

    if (accessUrl && actionDetail.icon) {
        ecommerceView.add(Ti.UI.createImageView(helperVisitorActionEcommerceIconImageView(accessUrl + actionDetail.icon)));
    }

    if (ecommerceText) {
        ecommerceView.add(Ti.UI.createLabel(helperVisitorActionEcommerceTypeLabel(ecommerceText)));
    }

    var itemDetailsView = Ti.UI.createView(helperVisitorActionEcommerceDetailsView());

    if (actionDetail.itemDetails) {
        for (var index = 0; index < actionDetail.itemDetails.length; index++) {
            var item     = actionDetail.itemDetails[index];
            var itemText = '';

            if (item.itemName) {
                itemText += item.itemName + ' ';
            }

            itemText += String.format('(%s)', '' + item.itemSKU);

            if (item.itemCategory) {
                itemText += ', ' + item.itemCategory;
            }

            var itemView = Ti.UI.createView(helperVisitorActionEcommerceDetailsItemView());

            itemView.add(Ti.UI.createLabel(helperVisitorActionEcommerceDetailsItemStarLabel(' * ')));
            itemView.add(Ti.UI.createLabel(helperVisitorActionEcommerceDetailsItemNameLabel(itemText)));
            itemDetailsView.add(itemView);
            itemView = null;

            var priceText = '';

            if (item.price) {
                priceText += item.price + ' ' + visitor.siteCurrency;
            }

            if (item.price && item.quantity) {
                priceText += ' - ';
            }

            if (item.quantity) {
                priceText += 'Quantity: ' + item.quantity;
            }

            itemDetailsView.add(Ti.UI.createLabel(helperVisitorActionEcommerceDetailsPriceLabel(priceText)));
        }
    }

    var revenueText = String.format('%s: %s %s', L('Live_GoalRevenue'),
                                                 '' +  actionDetail.revenue,
                                                 '' + visitor.siteCurrency);
    
    if (actionDetail.revenueSubTotal) {
        revenueText += String.format(', %s: %s %s', L('General_Subtotal'),
                                                    '' + actionDetail.revenueSubTotal,
                                                    '' + visitor.siteCurrency);
    }

    var listOfProductsText = String.format('List of Products (Quantity: %s)', '' + parseInt(actionDetail.items, 10));

    row.add(ecommerceView);
    ecommerceView = null;
    
    row.add(Ti.UI.createLabel(helperVisitorActionEcommerceRevenueLabel(revenueText)));
    row.add(Ti.UI.createLabel(helperVisitorActionEcommerceDetailsListLabel(listOfProductsText)));
    row.add(itemDetailsView);
    itemDetailsView = null;

    rows.push(row);
    row          = null;
    actionDetail = null;
    visitor      = null;
}

function toUnit(size)
{
    return OS_ANDROID ? (size + 'dp') : size;
}

function helperVisitorActionActionPageTitleLabel(text) {
    return {
        text: (text+'') || '',
        left: OS_ANDROID ? '16dp' : toUnit(10),
        font: {fontSize: toUnit(13), fontWeight: 'bold'},
        top: toUnit(5),
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE};
}

function helperVisitorActionActionUrlLabel(text) {
    return {
        text: (text+'') || '',
        left: OS_ANDROID ? '16dp' : toUnit(10),
        color: '#555555',
        font: {fontSize: toUnit(13)},
        top: toUnit(3),
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE};
}

function helperVisitorActionActionServerTimeLabel(text) {
    return {
        text: (text+'') || '',
        bottom: toUnit(5),
        top: toUnit(3),
        left: OS_ANDROID ? '16dp' : toUnit(10),
        font: {fontSize: toUnit(13)},
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE};
}

function helperVisitorActionActionTableViewRow() {
    return {
        layout: 'vertical',
        height: Ti.UI.SIZE,
        width: Ti.UI.FILL,
        selectionStyle: 0
    };
}

function helperVisitorActionDefaultTableViewRow() {
    return {
        layout: 'vertical',
        height: Ti.UI.SIZE,
        width: Ti.UI.FILL,
        selectionStyle: 0};
}

function helperVisitorActionDefaultHeadlineView() {
    return {
        layout: 'horizontal',
        left: OS_ANDROID ? '16dp' : toUnit(10),
        top: toUnit(5),
        height: Ti.UI.SIZE,
        width: Ti.UI.FILL};
}

function helperVisitorActionDefaultIconImageView(image) {
    return {
        image: image,
        left: 0,
        top: toUnit(4),
        width: toUnit(10),
        height: toUnit(9),
        canScale: false,
        enableZoomControls: false};
}

function helperVisitorActionDefaultTypeLabel(text) {
    return {
        text: (text+'') || '',
        top: 0,
        left: OS_ANDROID ? '16dp' : toUnit(10),
        font: {fontSize: toUnit(13), fontWeight: 'bold'},
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE};
}

function helperVisitorActionDefaultUrlLabel(text) {
    return {
        text: (text+'') || '',
        color: '#808080',
        bottom: toUnit(5),
        left: OS_ANDROID ? '16dp' : toUnit(10),
        top: toUnit(4),
        font: {fontSize: toUnit(13)},
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE};
}

function helperVisitorActionEcommerceTableViewRow() {
    return {
        layout: 'vertical',
        height: Ti.UI.SIZE,
        width: Ti.UI.FILL,
        selectionStyle: 0};
}

function helperVisitorActionEcommerceHeadlineView() {
    return {
        layout: 'horizontal',
        left: OS_ANDROID ? '16dp' : toUnit(10),
        top: toUnit(5),
        height: Ti.UI.SIZE,
        width: Ti.UI.FILL};
}

function helperVisitorActionEcommerceIconImageView(image) {
    return {
        image: image,
        top: toUnit(4),
        left: 0,
        width: toUnit(10),
        height: toUnit(10),
        canScale: false,
        enableZoomControls: false};
}

function helperVisitorActionEcommerceTypeLabel(text) {
    return {
        text: (text+'') || '',
        top: toUnit(1),
        left: OS_ANDROID ? '16dp' : toUnit(10),
        font: {fontSize: toUnit(13), fontWeight: 'bold'},
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE};
}

function helperVisitorActionEcommerceDetailsView() {
    return {
        layout: 'vertical',
        width: Ti.UI.FILL,
        height: Ti.UI.SIZE,
        left: 0,
        bottom: toUnit(5),
        top: toUnit(4)};
}

function helperVisitorActionEcommerceDetailsItemView() {
    return {
        layout: 'horizontal',
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        left: toUnit(10)};
}

function helperVisitorActionEcommerceDetailsItemStarLabel(text) {
    return {
        text: (text+'') || '',
        left: 0,
        color: '#808080',
        font: {fontSize: toUnit(13)},
        top: toUnit(3),
        width: toUnit(15),
        height: Ti.UI.SIZE};
}

function helperVisitorActionEcommerceDetailsItemNameLabel(text) {
    return {
        text: (text+'') || '',
        left: toUnit(5),
        color: '#808080',
        font: {fontSize: toUnit(13)},
        top: toUnit(3),
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE};
}

function helperVisitorActionEcommerceRevenueLabel(text) {
    return {
        text: (text+'') || '',
        left: OS_ANDROID ? '16dp' : toUnit(10),
        font: {fontSize: toUnit(13)},
        top: toUnit(4),
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE};
}

function helperVisitorActionEcommerceDetailsListLabel(text) {
    return {
        text: (text+'') || '',
        left: OS_ANDROID ? '16dp' : toUnit(10),
        font: {fontSize: toUnit(13)},
        top: toUnit(4),
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE};
}

function helperVisitorActionEcommerceDetailsPriceLabel(text) {
    return {
        text: (text+'') || '',
        left: OS_ANDROID ? '36dp' : toUnit(30),
        color: '#808080',
        font: {fontSize: toUnit(13)},
        top: toUnit(4),
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE};
}
