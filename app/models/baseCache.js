/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function getCurrentTimestamp ()
{
    return Math.floor(new Date().getTime() / 1000);
}

function getExpireTimestamp(expiration_seconds)
{
    return getCurrentTimestamp() + expiration_seconds;
}

function decodeValue(value)
{
    return JSON.parse(value);
}

function encodeValue(value)
{
    return JSON.stringify(value);
}

var cachingEnabled = require('alloy').CFG.caching.enabled;

exports.definition = {
    
    config: {
        "columns": {
            "expireTimestamp":"integer",
            "key":"key",
            "value":"string"
        },
        "adapter": {
            "type": "session",
            "collection_name": "cache"
        },
        "modelName": "baseCache"
    },      

    extendModel: function(Model) {      
        _.extend(Model.prototype, {

            initialize: function () {
                var value = this.get('value');
                if (value) {
                    this.set({value: encodeValue(value)}, {silent: true});
                }
            },

            isExpired: function () {
                var expireTimestamp = this.get('expireTimestamp');

                if (!expireTimestamp) {
                    return true;
                }

                return expireTimestamp <= getCurrentTimestamp();
            },

            getKey: function () {
                return this.get('key');
            },

            getCachedValue: function () {

                return decodeValue(this.get('value'));
            }

            // extended functions go here

        }); // end extend
        
        return Model;
    },
    
    
    extendCollection: function(Collection) {        
        _.extend(Collection.prototype, {

            cleanupModel: function (model) {
                if (!model) {
                    return;
                }

                console.debug('Cleaned up a cache entry', model.getKey());

                this.remove(model);
                model.destroy();
            },

            cleanup: function () {

                var self = this;

                this.forEach(function (model) {
                    if (model.isExpired()) {
                        self.cleanupModel(model);
                    }
                });

                self = null;
            },

            put: function (key, value, timeout) {
                if (!cachingEnabled) {
                    return;
                }

                console.debug('Putting cache key: ' + key);

                this.cleanup();
                var model = Alloy.createModel(this.config.modelName, {
                    key: key,
                    value: value,
                    expireTimestamp: getExpireTimestamp(timeout)
                });

                model.save();

                this.add(model);
            },

            get: function (key) {
                if (!cachingEnabled) {
                    return null;
                }

                var self = this;

                var entries = this.where({key: key}).filter(function (model) {
                    if (model.isExpired()) {
                        self.cleanupModel(model);
                        return false;
                    }

                    return true;
                });

                self = null;

                if (entries && entries.length) {
                    console.debug('Cache hit: ' + key);
                    return entries[entries.length - 1];
                }

                console.debug('Cache miss: ' + key);

                return null;
            }
            // extended functions go here           
            
        }); // end extend
        
        return Collection;
    }
        
}

