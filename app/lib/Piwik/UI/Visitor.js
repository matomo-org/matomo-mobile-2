/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/** @private */
var Piwik = require('library/Piwik');
/** @private */
var _     = require('library/underscore');

/**
 * @class     A visitor is created by the method Piwik.UI.createVisitor. The visitor UI widget displays detailed
 *            information of a single visitor. Like visit date/time, referrer, actions, duration, custom
 *            variables, plugins, screen and more. The visitor information will be displayed within a window. 
 *
 * @param     {Object}  params            See {@link Piwik.UI.View#setParams}
 * @param     {Object}  params.visitor    An object containing all available visitor information. As returned by the
 *                                        method 'Live.getgetLastVisitsDetails'.
 * @param     {string}  params.accessUrl  The url to the piwik installation (to the piwik installation the visit
 *                                        belongs to) containing a trailing slash. For example 'http://demo.piwik.org/'
 * @param     {string}  params.openView   An instance of a Titanium UI widget. This is needed for the PopOver creation.
 *                                        The arrow of the PopOver (iPad) will point to this view. If this view is not
 *                                        given, the visitor will not be opened on iPad or crash.
 *
 * @example
 * var visit = Piwik.getUI().createVisitor({visitor: visitor, accessUrl: accessUrl, openView: tableViewRow});
 *
 * @exports   Visitor as Piwik.UI.Visitor
 * @augments  Piwik.UI.View
 */
function Visitor () {

    /**
     * Holds an array of rendered rows. These rows are accessible via {@link Piwik.UI.Visitor#getRows}
     *
     * @type  Array
     *
     * Array (
     *    [int] => [Ti.UI.TableViewRow]
     * )
     * 
     * @private
     */
    this._rows = [];
}

/**
 * Extend Piwik.UI.View
 */
Visitor.prototype = Piwik.require('UI/View');

/**
 * Initializes and triggers several methods to render the content.
 *
 * @returns  {Piwik.UI.Visitor}  An instance of the current state.
 */
Visitor.prototype.init = function () {

    var visitor = this.getParam('visitor');

    if (!visitor) {
        Piwik.getLog().warn('visitor is not given', 'Piwik.UI.Visitor::init');
        
        return this;
    }

    this.createOverview();
    this.createCustomVariables();
    this.createSystem();
    this.createActionDetails();
    
    var win       = this.create('ModalWindow', {title: _('General_Visitor'), openView: this.getParam('openView')});
    var tableView = this.create('TableView', {id: 'visitorTableView'});

    win.add(tableView.get());
    
    tableView.setData(this.getRows());
    win.open();
    
    var that = this;
    win.addEventListener('close', function () {

        if (that && that.cleanup) {
            that.cleanup();
            that = null;
        }

        if (win && tableView) {
            win.remove(tableView.get());
            tableView.cleanup();
            win.cleanup();
        }
      
        win       = null;
        tableView = null;
    });

    Piwik.getTracker().trackEvent({title: 'View Visitor', url: '/visitor/open'});

    visitor = null;
};

/**
 * Get the list of rendered content/rows. See {@link Piwik.UI.Visitor#rows}
 *
 * @type  Array
 */
Visitor.prototype.getRows = function () {
    
    return this._rows;
};

/**
 * Creates an overview of the visitor.
 * Output looks like:
 * <br />
 * $VISITDATE<br />
 * Visitor IP        $IP<br />
 * Visitor Type      $TYPE<br />
 * From              $REFERRER<br />
 * $REFERRERURL<br />
 * Number of Visits  $VISITCOUNT<br />
 * Visit converted   $VISITCONVERTEDVALUE<br />
 * Goals converted   $GOALCONVERSIONS<br />
 * Country           $COUNTRY $COUNTRYFLAGICON<br />
 */
Visitor.prototype.createOverview = function () {
    var visitor   = this.getParam('visitor', {});
    var accessUrl = this.getParam('accessUrl', '');

    var visitDateLabel = String.format('%s - %s (%s)', '' + visitor.serverDatePretty,
                                                       '' + visitor.serverTimePretty,
                                                       '' + visitor.visitDurationPretty);

    this._rows.push(this.create('TableViewRow', {title: visitDateLabel, className: 'visitorTableViewRow'}));

    if (visitor.visitIp) {
        this._rows.push(this.create('TableViewRow', {title: _('General_VisitorIP'),
                                                     className: 'visitorTableViewRow',
                                                     value: visitor.visitIp}));
    }
    
    if (visitor.visitorType) {
        var visitorTypeText = visitor.visitorType;
        
        switch (visitorTypeText) {
            case 'new':
                visitorTypeText = _('General_NewVisitor');
                break;

            case 'returning':

                visitorTypeText = '' + visitor.visitorType;

                if (visitor.visitCount) {
                    var visits = '' + (parseInt(visitor.visitCount, 10));
                    visits     = String.format(_('VisitsSummary_NbVisits'), visits);

                    visitorTypeText += String.format(' (%s)', visits);
                }
                break;
        }

        this._rows.push(this.create('TableViewRow', {title: _('General_VisitType'),
                                                     className: 'visitorTableViewRow',
                                                     value: visitorTypeText}));
    }

    if (visitor.goalConversions) {
        var goalConversionsText = String.format(_('General_VisitConvertedNGoals'),
                                                '' + parseInt(visitor.goalConversions, 10));
        this._rows.push(this.create('TableViewRow', {title: goalConversionsText,
                                                     className: 'visitorTableViewRow'}));
    }

    // @todo display more information about the referrer
    var referrerValue = visitor.referrerName ? visitor.referrerName : visitor.referrerTypeName;

    if (referrerValue) {
        var referrerParams = {title: _('General_FromReferrer'),
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

        var referrerRow = this.create('TableViewRow', referrerParams);

        referrerRow.addEventListener('click', function () {
            if (visitor.referrerUrl) {

                Piwik.getTracker().trackLink('/visitor/referrer-url', 'link');
                Titanium.Platform.openURL(visitor.referrerUrl);
            }
        });

        this._rows.push(referrerRow);
        referrerRow = null;
    }

    if (visitor.country) {
        this._rows.push(this.create('TableViewRow', {title: _('UserCountry_Country'),
                                                     value: visitor.country,
                                                     className: 'visitorTableViewRow'}));
        // leftImage: {url: accessUrl + visitor.countryFlag}
    }
};

/**
 * Displays all custom variables of the user.
 * Output looks like:
 * <br />
 * Custom Variables<br />
 * $VARNAME     $VARVALUE<br />
 * $VARNAME     $VARVALUE<br />
 * $VARNAME     $VARVALUE<br />
 */
Visitor.prototype.createCustomVariables = function () {

    var visitor = this.getParam('visitor', {});

    if (!visitor.customVariables) {

        return;
    }

    this._rows.push(this.create('TableViewSection', {title: _('CustomVariables_CustomVariables')}));

    for (var customVariableIndex in visitor.customVariables) {

        var customVariable      = visitor.customVariables[customVariableIndex];
        var customVariableName  = customVariable['customVariableName' + customVariableIndex];
        var customVariableValue = customVariable['customVariableValue' + customVariableIndex];

        this._rows.push(this.create('TableViewRow', {title: customVariableName,
                                                     className: 'visitorTableViewRow',
                                                     value: customVariableValue}));
    }
    
    visitor = null;
};

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
Visitor.prototype.createSystem = function () {

    var visitor   = this.getParam('visitor', {});
    var accessUrl = this.getParam('accessUrl', '');

    this._rows.push(this.create('TableViewSection', {title: _('UserSettings_VisitorSettings')}));

    if (visitor.operatingSystem) {
        this._rows.push(this.create('TableViewRow', {title: 'OS',
                                                     className: 'visitorTableViewRow',
                                                     value: visitor.operatingSystem}));
        // leftImage: {url: accessUrl + visitor.operatingSystemIcon}
    }

    if (visitor.browserName) {
        this._rows.push(this.create('TableViewRow', {title: _('UserSettings_ColumnBrowser'),
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
        this._rows.push(this.create('TableViewRow', {title: _('UserSettings_ColumnResolution'),
                                                     className: 'visitorTableViewRow',
                                                     value: resolution}));
    }

    if (visitor.pluginsIcons && visitor.pluginsIcons.length && accessUrl) {

        var row = this.create('TableViewRow', {className: 'visitorTableViewRow'});
        row.add(Ti.UI.createLabel({text: _('UserSettings_Plugins'),
                                   id: 'tableViewRowTitleLabel'}));
        
        var right = 10;
        for (var index = 0; index < visitor.pluginsIcons.length; index++) {
            var pluginIcon = visitor.pluginsIcons[index];

            // @todo not all icons are 18x18
            if (pluginIcon.pluginIcon) {
                row.add(Ti.UI.createImageView({image: accessUrl + pluginIcon.pluginIcon,
                                               right: right,
                                               width: 14,
                                               height: 14,
                                               className: 'pluginIcon'}));
            }

            right +=28;
        }

        this._rows.push(row);
        row = null;
    }
    
    visitor = null;
};

/**
 * Triggers the rendering of several actions.
 */
Visitor.prototype.createActionDetails = function () {

    var visitor = this.getParam('visitor', {});
    if (!visitor.actionDetails || !visitor.actionDetails.length) {
        visitor = null;

        return;
    }

    var numActions = parseInt(visitor.actions, 10);
    
    this._rows.push(this.create('TableViewSection', {title: String.format(_('VisitsSummary_NbActions'),
                                                                          '' + numActions)}));

    for (var index = 0; index < visitor.actionDetails.length; index++) {
        var actionDetail = visitor.actionDetails[index];

        if (!actionDetail) {
            continue;
        }

        switch (actionDetail.type) {
            case 'action':
                this.createActionAction(actionDetail, visitor);
                break;

            case 'ecommerceOrder':
            case 'ecommerceAbandonedCart':
                this.createEcommerceAction(actionDetail, visitor);
                break;

            default:
                this.createDefaultAction(actionDetail, visitor);
                break;
        }
    }
    
    visitor = null;
};

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
Visitor.prototype.createActionAction = function (actionDetail) {

    var row = Ti.UI.createTableViewRow({className: 'visitorActionActionTableViewRow'});

    if (actionDetail.pageTitle) {
        row.add(Ti.UI.createLabel({text: '' + actionDetail.pageTitle, id: 'visitorActionActionPageTitleLabel'}));
    }
    if (actionDetail.url) {
        row.add(Ti.UI.createLabel({text: actionDetail.url, id: 'visitorActionActionUrlLabel'}));
    }
    if (actionDetail.serverTimePretty) {
        row.add(Ti.UI.createLabel({text: actionDetail.serverTimePretty, id: 'visitorActionActionServerTimeLabel'}));
    }

    this._rows.push(row);
    row = null;
    actionDetail = null;
};

/**
 * Renders the 'default' action. For example 'outlink', 'goal' or 'download'.
 * Output looks like:
 * <br />
 * $ICON $TYPE<br />
 * $URL<br />
 *
 * @param  {Object}  actionDetail
 */
Visitor.prototype.createDefaultAction = function (actionDetail) {

    var accessUrl = this.getParam('accessUrl', '');
    
    var row       = Ti.UI.createTableViewRow({className: 'visitorActionDefaultTableViewRow'});

    var view      = Ti.UI.createView({id: 'visitorActionDefaultHeadlineView'});

    if (accessUrl && actionDetail.icon) {
        view.add(Ti.UI.createImageView({image: accessUrl + actionDetail.icon,
                                        id: 'visitorActionDefaultIconImageView'}));
    }

    if (actionDetail.type) {

        var title = '' + actionDetail.type;

        switch (actionDetail.type) {
            case 'goal':
                title = _('General_Goal');
                break;
            
            case 'download':
                title = _('General_Download');
                break;

            case 'outlink':
                title = _('General_Outlink');
                break;
        }

        view.add(Ti.UI.createLabel({text: title, id: 'visitorActionDefaultTypeLabel'}));
    }

    row.add(view);
    view = null;

    if (actionDetail.url) {
        row.add(Ti.UI.createLabel({text: '' + actionDetail.url, id: 'visitorActionDefaultUrlLabel'}));
    }

    this._rows.push(row);
    row          = null;
    actionDetail = null;
};

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
Visitor.prototype.createEcommerceAction = function (actionDetail) {
    var visitor       = this.getParam('visitor', {});
    var accessUrl     = this.getParam('accessUrl', '');
    var row           = Ti.UI.createTableViewRow({className: 'visitorActionEcommerceTableViewRow'});
    var ecommerceView = Ti.UI.createView({id: 'visitorActionEcommerceHeadlineView'});
    var ecommerceText = '';

    switch (actionDetail.type) {
        case 'ecommerceOrder':
            ecommerceText = _('Goals_EcommerceOrder');

            break;

        case 'ecommerceAbandonedCart':
            ecommerceText = _('Goals_AbandonedCart');

            break;

        default:
            ecommerceText = _('Goals_Ecommerce');
    }

    if (actionDetail.orderId) {
        ecommerceText = String.format('%s (%s)', '' + ecommerceText, '' + actionDetail.orderId);
    }

    if (accessUrl && actionDetail.icon) {
        ecommerceView.add(Ti.UI.createImageView({image: accessUrl + actionDetail.icon,
                                                 id: 'visitorActionEcommerceIconImageView'}));
    }

    if (ecommerceText) {
        ecommerceView.add(Ti.UI.createLabel({text: ecommerceText, id: 'visitorActionEcommerceTypeLabel'}));
    }

    var itemDetailsView = Ti.UI.createView({id: 'visitorActionEcommerceDetailsView'});

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

            var itemView = Ti.UI.createView({id: 'visitorActionEcommerceDetailsItemView'});

            itemView.add(Ti.UI.createLabel({text: ' * ', id: 'visitorActionEcommerceDetailsItemStarLabel'}));
            itemView.add(Ti.UI.createLabel({text: itemText, id: 'visitorActionEcommerceDetailsItemNameLabel'}));
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

            itemDetailsView.add(Ti.UI.createLabel({text: priceText, id: 'visitorActionEcommerceDetailsPriceLabel'}));
        }
    }

    var revenueText = String.format('%s: %s %s', _('Live_GoalRevenue'),
                                                 '' +  actionDetail.revenue,
                                                 '' + visitor.siteCurrency);
    
    if (actionDetail.revenueSubTotal) {
        revenueText += String.format(', %s: %s %s', _('General_Subtotal'),
                                                    '' + actionDetail.revenueSubTotal,
                                                    '' + visitor.siteCurrency);
    }

    var listOfProductsText = String.format('List of Products (Quantity: %s)', '' + parseInt(actionDetail.items, 10));

    row.add(ecommerceView);
    ecommerceView = null;
    
    row.add(Ti.UI.createLabel({text: revenueText, id: 'visitorActionEcommerceRevenueLabel'}));
    row.add(Ti.UI.createLabel({text: listOfProductsText, id: 'visitorActionEcommerceDetailsListLabel'}));
    row.add(itemDetailsView);
    itemDetailsView = null;

    this._rows.push(row);
    row          = null;
    actionDetail = null;
    visitor      = null;
};

/**
 * Cleanup.
 */
Visitor.prototype.cleanup = function () {

    if (this._rows) {
        for (var index in this._rows) {
            if (this._rows[index] && this._rows[index].cleanup) {
                this._rows[index].cleanup();
            }
            
            this._rows[index] = null;
        }
    }
    
    this._rows  = null;
    this.params = null;
    this.window = null;
};

module.exports = Visitor;