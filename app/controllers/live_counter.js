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
var visits  = args.visits || '-';
var actions = args.actions || '-';
var title   = args.title || '-';

function counterValue(visits, actions)
{
    return String.format('%s %s, %s %s',
                         '' + visits,
                         L('General_ColumnNbVisits'),
                         '' + actions,
                         L('General_ColumnPageviews'));
}

function updateDisplayedValues(title, visits, actions)
{
    $.title.text   = title;
    $.counter.text = counterValue(visits, actions);
}

updateDisplayedValues(title, visits, actions);