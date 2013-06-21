/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function getBaseCacheDefinition()
{
    return require('alloy/models/BaseCache').definition;
}

function shallowCopy(obj)
{
    return require('alloy/underscore').clone(obj);
}

function copyObjectDeep(obj)
{
    return JSON.parse(JSON.stringify(obj));
}

var cacheDefinition    = getBaseCacheDefinition();
cacheDefinition        = shallowCopy(cacheDefinition);
cacheDefinition.config = copyObjectDeep(cacheDefinition.config);
cacheDefinition.config.adapter.type = 'session';
cacheDefinition.config.modelName = 'sessionCache';

exports.definition = cacheDefinition;

