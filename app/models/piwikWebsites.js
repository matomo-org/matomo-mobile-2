/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

exports.definition = {
    
    config: {
        "columns": {
            "idsite":"integer",
            "label":"string",
            "name":"string",
            "nb_visits":"integer",
            "nb_actions":"integer",
            "nb_pageviews":"integer",
            "revenue":"integer",
            "visits_evolution":"string",
            "actions_evolution":"string",
            "pageviews_evolution":"string",
            "revenue_evolution":"string"
        },
        "adapter": {
            "type": "piwikapi",
            "collection_name": "piwikwebsites"
        },
        "cache": {time: 60 * 60, type: 'session'}, // 1 hour
        "settings": {
            "method": "MultiSites.getAll",
            "displayErrors": true
        },
        "defaultParams": {
            "enhanced": 1
        }
    },      

    extendModel: function(Model) {      
        _.extend(Model.prototype, {
            
            idAttribute: "idsite",

            initialize: function (attributes) {
                // label comes from MultiSites.getAll API but should be name as in SitesManager
                if (attributes && attributes.label) {
                    this.set({name: attributes.label}, {silent: true});
                }
            },

            getName: function () {
                return this.get('name');
            },

            getSiteId: function () {
                return parseInt(this.get('idsite'), 10);
            }

            // extended functions go here

        }); // end extend
        
        return Model;
    },
    
    
    extendCollection: function(Collection) {        
        _.extend(Collection.prototype, {

            getNumberOfWebsites: function () {
                return this.length;
            },

            hasWebsites: function () {
                return !!this.getNumberOfWebsites();
            },

            fetchWebsites: function (sortOrderColumn, options) {

                if (!options) {
                    options = {};
                }
                if (!options.params) {
                    options.params = {};
                }

                options.params.sortOrderColumn    = sortOrderColumn;
                options.params.filter_sort_column = sortOrderColumn;
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

