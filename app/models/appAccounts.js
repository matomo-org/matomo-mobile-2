
/** @private */
var storage = require('Piwik/App/Storage');
var Piwik   = require('Piwik');


exports.definition = {

    config: {
        "columns": {
            "id":"string",
            "accessUrl":"string",
            "username":"string",
            "tokenAuth":"string",
            "name":"string",
            "active":"boolean",
            "createVersionNumber":"string",
            "changeVersionNumber":"string",
            "version":"string",
            "dateVersionUpdated":"string"
        },
        "adapter": {
            "type": "properties",
            "collection_name": "appaccounts"
        }
    },      

    extendModel: function(Model) {      
        _.extend(Model.prototype, {

            activateAccount: function () {
                
                this.set({active: 1});
                this.save();
                
                return this;
            },

            deactivateAccount: function () {
                
                this.set({active: 0});
                this.save();
                
                return this;
            },

            resetPiwikVersion: function () {
                
                this.set({version: 0, dateVersionUpdated: null});
                
                return this;
            },

            updatePiwikVersion: function() {
                
                if (!this.get('dateVersionUpdated')) {
                    // version not updated yet. Set it to null. new Date(null) will be Jan 01 1970 and therefore force an update
                    this.set({'dateVersionUpdated': null});
                }
            
                var dateNow             = (new Date()).toDateString();
                var lastUpdatedDate     = new Date(this.get('dateVersionUpdated'));
                var alreadyUpdatedToday = dateNow == lastUpdatedDate.toDateString();
            
                if (alreadyUpdatedToday) {
                    // request it max once per day
                    
                    return;
                }
                
                var that = this;
                var version = Alloy.createCollection('piwikVersion');
                version.fetch({
                    success : function(model, response) {

                        that.set({dateVersionUpdated: (new Date()) + ''});
                        
                        if (response) {
                            var stringUtils = Piwik.require('Utils/String');
                            that.set({version: stringUtils.toPiwikVersion(response.value)});
                            stringUtils     = null;
                        } else if (!account.version) {
                            that.set({version: 0});
                        } else {
                            // there went something wrong with the request. For example the network connection broke up.
                            // do not set account version to 0 in such a case. We would overwrite an existing version, eg 183
                        }
                        
                        that.save();
                    },
                    error : function(model, resp) {
                        alert('Error 1');
                    }
                });
            }

        }); // end extend
        
        return Model;
    },
    
    
    extendCollection: function(Collection) {
        _.extend(Collection.prototype, {

            getNumAccounts: function () {
                return this.length;
            }

            
        }); // end extend
        
        return Collection;
    }
        
}

