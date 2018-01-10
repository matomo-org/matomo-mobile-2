/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

exports.definition = {
    
    config: {
        "columns": {
            "value":"string"
        },
        "adapter": {
            "type": "piwikapi",
            "collection_name": "piwikversion"
        },
        "cache": {time: 60 * 60 * 24, type: 'persistent'},// 24hours
        "settings": {
            "method": "API.getPiwikVersion",
            "displayErrors": false
        },
        "defaultParams": {
            limit: 1
        },
        defaults: {
            value: ''
        }
    },        

    extendModel: function(Model) {        
        _.extend(Model.prototype, {

            getVersion: function () {
                return this.get('value');
            },

            validResponse: function (response) {

                return !!response && _.isObject(response) && _.has(response, 'value');
            },
            
            isFullyCompatible: function ()
            {
                if (!this.getVersion()) {
                    return false;
                }
                
                return require('Piwik').isVersionGreaterThanOrEqual('2.0', this.getVersion());
            },
            
            isRestrictedCompatible: function ()
            {
                if (!this.getVersion() || this.isFullyCompatible()) {
                    return false;
                }
                
                return require('Piwik').isVersionGreaterThanOrEqual('1.12', this.getVersion());
            }

        }); // end extend
        
        return Model;
    },
    
    
    extendCollection: function(Collection) {        
        _.extend(Collection.prototype, {

            validResponse: function (response) {

                return !!response && _.isObject(response) && _.has(response, 'value');
            }
            // extended functions go here            
            
        }); // end extend
        
        return Collection;
    }

};

