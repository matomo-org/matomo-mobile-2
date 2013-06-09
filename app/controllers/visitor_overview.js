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

var args      = arguments[0] || {};
var accessUrl = args.account ? args.account.getBasePath() : 'http://demo.piwik.org/';
var visitor   = args.visitor || null;

function goalConversionDescription(visitor)
{
    var goalsText = String.format(L('General_VisitConvertedNGoals'), 
                                  '' + visitor.goalConversions);

    return goalsText;
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
    return visitor.serverDatePretty + ' ' + visitor.serverTimePretty;
}

function updateDisplayedValues(visitor)
{
    if (!visitor) {

        return;
    }

    if (visitor.goalConversions) {
        $.index.backgroundColor = '#FFFFC4';
    }

    $.visittime.text = visitTime(visitor);
    $.referrer.text  = referrerDescription(visitor);
    $.pageViews.text = goalConversionDescription(visitor);
    $.goalConversions.text = pageviewsDescription(visitor);

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