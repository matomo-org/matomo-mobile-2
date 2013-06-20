/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
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

