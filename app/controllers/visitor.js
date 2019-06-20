/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function L(key)
{
    return require('L')(key);
}

var args    = arguments[0] || {};
var visitor = args.visitor;

var accountModel = require('session').getAccount();
var accessUrl    = accountModel ? accountModel.getBasePath() : 'https://demo.matomo.org/';

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

    if (OS_ANDROID) {
        // this prevents the tableViewRows from leaking memory
        $.visitorTable.setData([]);
    }
}

exports.open  = open;
exports.close = close;

function onOpen()
{
    require('Piwik/Tracker').trackWindow('Visitor Details', 'visitor-details');
}

function addNonSelectableSelectionStyleToRow(row)
{
    if (OS_IOS) {
        row.selectionStyle = Ti.UI.iOS.TableViewCellSelectionStyle.NONE;
    } else {
        row.backgroundSelectedColor = '#ffffff';
    }

    return row;
}

function createSelectableRow(params)
{
    var row = Alloy.createWidget('org.piwik.tableviewrow', null, params).getRow();

    if (OS_IOS) {
        row.selectionStyle = Ti.UI.iOS.TableViewCellSelectionStyle.GRAY;
    } else {
        row.backgroundSelectedColor = '#a9a9a9';
    }

    return row;
}

function createRow(params)
{
    var row = Alloy.createWidget('org.piwik.tableviewrow', null, params).getRow();

    return addNonSelectableSelectionStyleToRow(row);
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
                    visits     = String.format(L('General_NbVisits'), visits);

                    visitorTypeText += String.format(' (%s)', visits);
                }
                break;
        }

        rows.push(createRow({title: L('General_VisitType'),
                             className: 'visitorTableViewRow',
                             value: visitorTypeText}));
    }

    if (visitor.userId) {
        rows.push(createRow({title: 'User ID',
                             className: 'visitorTableViewRow', value: '' + visitor.userId}));
    }

    if (visitor.goalConversions) {
        var goalConversionsText = String.format(L('General_VisitConvertedNGoals'),
                                                '' + parseInt(visitor.goalConversions, 10));
        rows.push(createRow({title: goalConversionsText,
                             className: 'visitorTableViewRow'}));
    }

    // @todo display more information about the referrer
    var referrerValue = '';

    if (visitor.referrerName) {
        referrerValue = visitor.referrerName;
    } else if (visitor.referrerTypeName) {
        referrerValue = visitor.referrerTypeName;
    }

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

        var referrerRow = createSelectableRow(referrerParams);

        if (visitor.referrerUrl) {
            referrerRow.addEventListener('click', (function (referrerUrl) {
                return function () {
                    if (referrerUrl) {
                        require('Piwik/Tracker').trackLink('/visitor/referrer-url', 'link');
                        Ti.Platform.openURL(referrerUrl);
                    }
                };
            })(visitor.referrerUrl));
        }

        rows.push(referrerRow);
        referrerRow = null;
    }

    if (visitor.country) {
        rows.push(createRow({title: L('UserCountry_Country'),
                             value: visitor.country,
                             className: 'visitorTableViewRow'}));
        // leftImage: {url: accessUrl + visitor.countryFlag}
    }

    if (visitor.city) {
        rows.push(createRow({title: L('UserCountry_City'),
                             value: visitor.city,
                             className: 'visitorTableViewRow'}));
    }

    if (visitor.region) {
        rows.push(createRow({title: L('UserCountry_Region'),
                             value: visitor.region,
                             className: 'visitorTableViewRow'}));
    }

    visitor = null;
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

    rows.push(createSection({title: L('General_VisitorSettings')}));

    if (visitor.operatingSystem) {
        rows.push(createRow({title: 'OS',
                             className: 'visitorTableViewRow',
                             value: visitor.operatingSystem}));
        // leftImage: {url: accessUrl + visitor.operatingSystemIcon}
    }

    if (visitor.browserName) {
        rows.push(createRow({title: L('DevicesDetection_ColumnBrowser'),
                             className: 'visitorTableViewRow',
                             value: visitor.browserName}));
        // leftImage: {url: accessUrl + visitor.browserIcon}
    }

    var resolution = '';
    if (visitor.resolution) {
        resolution = visitor.resolution;
    }

    if (resolution &&
        visitor.screenType &&
        'normal' != ('' + visitor.screenType).toLowerCase()) {
        resolution += String.format(' (%s)', ''+ visitor.screenType);
        // accessUrl + visitor.screenTypeIcon
    }

    if (resolution) {
        rows.push(createRow({title: L('Resolution_ColumnResolution'),
                             className: 'visitorTableViewRow',
                             value: resolution}));
    }

    if (visitor.pluginsIcons && visitor.pluginsIcons.length && accessUrl) {

        var row = createRow({title: L('General_Plugins'), className: 'visitorTableViewRow'});

        var right = 10;
        for (var index = 0; index < visitor.pluginsIcons.length; index++) {
            var pluginIcon = visitor.pluginsIcons[index];

            // TODO not all icons are 14x14
            if (pluginIcon.pluginIcon) {
                var imageOptions = {
                    classes: ['pluginIcon'],
                    image: accessUrl + pluginIcon.pluginIcon,
                    right: OS_ANDROID ? (right + 'dp') : right
                };
                row.add($.UI.create('ImageView', imageOptions));
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
    
    rows.push(createSection({title: String.format(L('VisitsSummary_NbActionsDescription'),
                             '' + numActions)}));

    for (var index = 0; index < visitor.actionDetails.length; index++) {
        var actionDetail = visitor.actionDetails[index];

        if (!actionDetail) {
            continue;
        }

        if ('title' in actionDetail
            && actionDetail.title
            && actionDetail.type !== 'ecommerceOrder'
            && actionDetail.type !== 'ecommerceAbandonedCart') {
            // since Matomo 3.7.0
            // we prefer to still render ecommerce action manually
            createGenericAction(actionDetail, visitor, accessUrl);
            continue;
        }

        // pre Matomo 3.7.0
        switch (actionDetail.type) {
            case 'action':
                createActionAction(actionDetail, visitor, accessUrl);
                break;

            case 'event':
                createEventAction(actionDetail, visitor, accessUrl);
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
 * Renders the 'event' action.
 * Output looks like:
 * <br />
 * $EVENTICON Event $EVENTCATEGORY<br />
 * $EVENTNAME<br />
 * Action "$EVENTACTION" - Value "$EVENTVALUE"<br />
 *
 * @param  {Object}  actionDetail
 */
function createEventAction(actionDetail, visitor, accessUrl)
{
    var row = $.UI.create('TableViewRow', {classes: ['actionTableViewRow']});
    addNonSelectableSelectionStyleToRow(row);

    var view = $.UI.create('View', {classes: ['actionHeadlineView']});

    if (accessUrl && actionDetail.icon) {
        view.add($.UI.create('ImageView', {classes: ['actionDefaultIconImageView'], image: (accessUrl + actionDetail.icon)}));
    }

    if (actionDetail.eventCategory) {
        var category = L('Events_Event') + ' ' + actionDetail.eventCategory;
        view.add($.UI.create('Label', {classes: ['actionActionPageTitleLabel'], text: category}));
    }

    row.add(view);
    view = null;

    if (actionDetail.eventName) {
        row.add($.UI.create('Label', {classes: ['actionActionUrlLabel'], text: actionDetail.eventName + ''}));
    }

    var actionAndValue = '';
    if (actionDetail.eventAction) {
        actionAndValue += L('General_Action') + ' "' + actionDetail.eventAction + '"';
    }
    if (actionDetail.eventAction && actionDetail.eventValue) {
        actionAndValue += ' - ';
    }
    if (actionDetail.eventValue) {
        actionAndValue += L('General_Value') + ' "' + actionDetail.eventValue + '"';
    }

    if (actionAndValue) {
        row.add($.UI.create('Label', {classes: ['actionActionUrlLabel'], text: actionAndValue}));
    }

    if (actionDetail.serverTimePretty) {
        row.add($.UI.create('Label', {classes: ['actionActionServerTimeLabel'], text: actionDetail.serverTimePretty + ''}));
    }

    rows.push(row);
    row = null;
    actionDetail = null;
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
function createActionAction(actionDetail)
{
    var row = $.UI.create('TableViewRow', {classes: ['actionTableViewRow']});
    addNonSelectableSelectionStyleToRow(row);

    if ('title' in actionDetail && actionDetail.title) {
        row.add($.UI.create('Label', {classes: ['actionActionPageTitleLabel'], text: actionDetail.title + ''}));
    } else if ('pageTitle' in actionDetail && actionDetail.pageTitle) {
        row.add($.UI.create('Label', {classes: ['actionActionPageTitleLabel'], text: actionDetail.pageTitle + ''}));
    }
    
    var label = null;
    if ('subtitle' in actionDetail && actionDetail.subtitle) {
        label = $.UI.create('Label', {classes: ['actionActionUrlLabel'], text: actionDetail.subtitle + ''});
        row.add(label);
        label = null;
    }
    
    if ('url' in actionDetail && actionDetail.url) {
        var label = $.UI.create('Label', {classes: ['actionActionUrlLabel'], text: actionDetail.url + ''});
        if (OS_ANDROID || Ti.Platform.canOpenURL(actionDetail.url)) {
            label.addEventListener('click', (function (actionDetailUrl) {
                return function () {
                    Ti.Platform.openURL(actionDetailUrl);
                };
            })(actionDetail.url));
        }
        row.add(label);
        label = null;
    }
    if ('serverTimePretty' in actionDetail && actionDetail.serverTimePretty) {
        row.add($.UI.create('Label', {classes: ['actionActionServerTimeLabel'], text: actionDetail.serverTimePretty + ''}));
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
function createDefaultAction(actionDetail, visitor, accessUrl)
{
    var row = $.UI.create('TableViewRow', {classes: ['actionTableViewRow']});
    addNonSelectableSelectionStyleToRow(row);

    var view = $.UI.create('View', {classes: ['actionHeadlineView']});

    if (accessUrl && actionDetail.icon) {
        view.add($.UI.create('ImageView', {classes: ['actionDefaultIconImageView'], image: (accessUrl + actionDetail.icon)}));
    }
    
    var title = '';
    if ('title' in actionDetail && actionDetail.title) {
    	title = actionDetail.title;
    } else if (actionDetail.type) {

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

			case 'form':
            case 95:
                title = 'Form';
                break;
                
			case 'media':
            case 94:
                title = 'Media';
                break;
        }
    }
    
    if (title) {
        view.add($.UI.create('Label', {classes: ['actionDefaultTypeLabel'], text: title}));
    }

    row.add(view);
    view = null;
    
    var label;
    if ('subtitle' in actionDetail && actionDetail.subtitle) {
        label = $.UI.create('Label', {classes: ['actionDefaultUrlLabel'], text: (actionDetail.subtitle + '')});
        row.add(label);
        label = null;
    }

    if (actionDetail.url) {
        label = $.UI.create('Label', {classes: ['actionDefaultUrlLabel'], text: (actionDetail.url + '')});
        row.add(label);

        if (OS_ANDROID || Ti.Platform.canOpenURL(actionDetail.url)) {
            label.addEventListener('click', (function (actionDetailUrl) {
                return function () {
                    Ti.Platform.openURL(actionDetailUrl);
                };
            })(actionDetail.url));
        }

        label = null;

    } else if (actionDetail.siteSearchKeyword) {
        row.add($.UI.create('Label', {classes: ['actionDefaultUrlLabel'], text: (actionDetail.siteSearchKeyword + '')}));
    }

    if ('serverTimePretty' in actionDetail && actionDetail.serverTimePretty) {
        row.add($.UI.create('Label', {classes: ['actionActionServerTimeLabel'], text: actionDetail.serverTimePretty + ''}));
    }
    
    rows.push(row);
    row          = null;
    actionDetail = null;
}

/**
 * Renders any generic action
 * <br />
 * $ICON $TITLE<br />
 * $SUBTITLE<br />
 * $TIMESTAMP<br />
 *
 * @param  {Object}  actionDetail
 */
function createGenericAction(actionDetail, visitor, accessUrl)
{
    var row = $.UI.create('TableViewRow', {classes: ['actionTableViewRow']});
    addNonSelectableSelectionStyleToRow(row);

    if (accessUrl && 'icon' in actionDetail && actionDetail.icon) {
	    var view = $.UI.create('View', {classes: ['actionHeadlineView']});
	
	    if (accessUrl && 'icon' in actionDetail && actionDetail.icon) {
	        view.add($.UI.create('ImageView', {classes: ['actionDefaultIconImageView'], image: (accessUrl + actionDetail.icon)}));
	    }
	
	    if ('title' in actionDetail && actionDetail.title) {
	        view.add($.UI.create('Label', {classes: ['actionGenericTypeLabel'], text: (actionDetail.title + '')}));
	    }
	    row.add(view);
	    view = null;
    } else if ('title' in actionDetail && actionDetail.title) {
        row.add($.UI.create('Label', {classes: ['actionActionPageTitleLabel'], text: (actionDetail.title + '')}));
    }


    var label;
    if ('subtitle' in actionDetail && actionDetail.subtitle) {
    		var subtitle = actionDetail.subtitle + '';
        label = $.UI.create('Label', {classes: ['actionDefaultUrlLabel'], text: subtitle});
        row.add(label);

		var containsWhitespace = !!subtitle.match(/\s/);
        var isUrlLike = subtitle && !containsWhitespace && (subtitle.toLowerCase().indexOf('http://') === 0 || subtitle.toLowerCase().indexOf('https://') === 0);

        if (isUrlLike) {
            label.addEventListener('click', (function (actionDetailUrl) {
                return function () {
                    Ti.Platform.openURL(actionDetailUrl);
                };
            })(subtitle));
        }
        label = null;
    }

    if ('serverTimePretty' in actionDetail && actionDetail.serverTimePretty) {
        row.add($.UI.create('Label', {classes: ['actionActionServerTimeLabel'], text: actionDetail.serverTimePretty + ''}));
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
function createEcommerceAction(actionDetail, visitor, accessUrl)
{
    var row = $.UI.create('TableViewRow', {classes: ['actionTableViewRow']});
    addNonSelectableSelectionStyleToRow(row);
    var ecommerceView = $.UI.create('View', {classes: ['actionHeadlineView']});
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
        ecommerceView.add($.UI.create('ImageView',
                                      {classes: ['actionEcommerceIconImageView'], image: (accessUrl + actionDetail.icon)}));
    }

    if (ecommerceText) {
        ecommerceView.add($.UI.create('Label', {classes: ['actionEcommerceTypeLabel'], text: (ecommerceText)}));
    }

    var itemDetailsView = $.UI.create('View', {classes: ['actionEcommerceDetailsView']});

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

            var itemView = $.UI.create('View', {classes: ['actionEcommerceDetailsItemView']});
            itemView.add($.UI.create('Label', {classes: ['actionEcommerceDetailsItemStarLabel'], text: ' * '}));
            itemView.add($.UI.create('Label', {classes: ['actionEcommerceDetailsItemNameLabel'], text: itemText}));

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

            itemDetailsView.add($.UI.create('Label', {classes: ['actionEcommerceDetailsPriceLabel'], text: priceText}));
        }
    }

    var revenueText = String.format('%s: %s %s', L('General_ColumnRevenue'),
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
    
    row.add($.UI.create('Label', {classes: ['actionEcommerceStandardLabel'], text: revenueText}));
    row.add($.UI.create('Label', {classes: ['actionEcommerceStandardLabel'], text: listOfProductsText}));
    row.add(itemDetailsView);
    itemDetailsView = null;

    rows.push(row);
    row          = null;
    actionDetail = null;
    visitor      = null;
}