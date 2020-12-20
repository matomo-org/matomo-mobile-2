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

var args      = arguments[0] || {};
var accessUrl = args.account ? args.account.getBasePath() : 'https://demo.matomo.org/';
var visitor   = args.visitor || null;

function goalConversionDescription(visitor)
{
    if ('undefined' == (typeof visitor.goalConversions)) {
        return '';
    }

    return String.format(L('General_VisitConvertedNGoals'), '' + visitor.goalConversions);
}

function pageviewsDescription(visitor) 
{
    var description = '';

    if (visitor.actions && visitor.visitDurationPretty) {
        description = String.format('%s %s (%s)',
                                    '' + visitor.actions,
                                    L('General_ColumnPageviews'),
                                    '' + visitor.visitDurationPretty);
    } else if (visitor.actions) {
        description = String.format('%s %s', '' + visitor.actions, L('General_ColumnPageviews'));
    }
    
    return description;
}

function referrerDescription(visitor) 
{
    var description = '';

    if (visitor.referrerName) {

        description      = L('General_FromReferrer') + ' ' + visitor.referrerName;

        if (visitor.referrerKeyword) {
            description += ' - ' + visitor.referrerKeyword;
        }

        if (visitor.referrerKeywordPosition) {
            description += String.format(' %s: #%s', 
                                         L('SEO_Rank'), 
                                         '' + visitor.referrerKeywordPosition);
        }
        
    } else if (visitor.referrerTypeName) {
        description      = L('General_FromReferrer') + ' ' + visitor.referrerTypeName;
    }
    
    visitor = null;

    return description;
}

function visitTime(visitor)
{
    if (visitor.serverDatePretty && visitor.serverTimePretty) {
        return visitor.serverDatePretty + ' ' + visitor.serverTimePretty;
    }

    return '';
}

function updateDisplayedValues(visitor)
{
    if (!visitor) {

        return;
    }

    if (visitor.visitEcommerceStatus && visitor.visitEcommerceStatus === 'ordered') {
        $.index.backgroundColor = '#D5FFC4';
    } else if (visitor.goalConversions) {
        $.index.backgroundColor = '#FFFFC4';
    }

    $.visittime.text = visitTime(visitor);

    var referrer       = referrerDescription(visitor);
    var goalConversion = goalConversionDescription(visitor);

    if (referrer) {
        $.referrer.text  = referrerDescription(visitor);
    } else {
        $.referrer.top = 0;
        $.referrer.height = 0;
        $.referrer.hide();
    }

    var pageviews = pageviewsDescription(visitor);

    if (pageviews) {
        $.pageViews.text = pageviews;
    } else {
        $.pageViews.top = 0;
        $.pageViews.height = 0;
        $.pageViews.hide();
    }

    if (goalConversion) {
        $.goalConversions.text = goalConversion;
    } else {
        $.goalConversions.top = 0;
        $.goalConversions.height = 0;
        $.goalConversions.hide();
    }

    if (visitor.countryFlag) {
        $.countryFlag.image = accessUrl + visitor.countryFlag;
    }

    if (visitor.browserIcon) {
        $.browserIcon.image = accessUrl + visitor.browserIcon;
    }

    if (visitor.operatingSystemIcon) {
        $.operatingSystemIcon.image = accessUrl + visitor.operatingSystemIcon;
    }
}

updateDisplayedValues(visitor);
