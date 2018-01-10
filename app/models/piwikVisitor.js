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
            "type": "session",
            "collection_name": "piwikvisitor"
        },
        "settings": {
        }
    },        

    extendModel: function(Model) {        
        _.extend(Model.prototype, {

        }); // end extend
        
        return Model;
    },
    
    
    extendCollection: function(Collection) {        
        _.extend(Collection.prototype, {
            
        }); // end extend
        
        return Collection;
    }
        
}

