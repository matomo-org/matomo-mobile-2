/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

exports.definition = {
    
    config: {
        "columns": {
            "idsegment":"integer",
            "name":"string",
            "definition":"string",
            "login":"string",
            "enable_all_users":"string",
            "enable_only_idsite":"string",
            "auto_archive":"string",
            "ts_created":"string",
            "ts_last_edit":"string",
            "deleted":"string"
        },
        "adapter": {
            "type": "piwikapi",
            "collection_name": "piwiksegments"
        },
        "cache": {time: 60 * 60 * 4, type: 'session'}, // 4 hours
        "settings": {
            "method": "SegmentEditor.getAll",
            "displayErrors": true
        },
        "defaultParams": {
            "enhanced": 1,"filter_limit": -1
        }
    },      

    extendModel: function(Model) {      
        _.extend(Model.prototype, {
            
            idAttribute: 'idsegment',

            getName: function () {
                return this.get('name');
            },

            getIdSegment: function () {
                return this.get('idsegment');
            },

            getDefinition: function () {
                return this.get('definition');
            }

            // extended functions go here

        }); // end extend
        
        return Model;
    },
    
    
    extendCollection: function(Collection) {        
        _.extend(Collection.prototype, {

            fetchSegments: function (options) {

                if (!options) {
                    options = {};
                }

                if (!options.params) {
                    options.params = {};
                }

                options.reset = true;

                this.abortRunningRequests();
                this.fetch(options);
            },

            validResponse: function (response) {

                if (response && _.isArray(response)) {
                    return true;
                }

                return false;
            }
            // extended functions go here           
            
        }); // end extend

        return Collection;
    }
        
};

