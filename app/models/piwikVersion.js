exports.definition = {
    
    config: {
        "columns": {
            "value":"string"
        },
        "adapter": {
            "type": "piwikapi",
            "collection_name": "piwikversion"
        },
        "settings": {
            "method": "API.getPiwikVersion",
            "cache": true,
            "displayErrors": false
        },
        "defaultParams": {
            limit: 1
        }
    },        

    extendModel: function(Model) {        
        _.extend(Model.prototype, {

            getLatestVersion: function () {
                return Alloy.CFG.piwik.latestServerVersion;
            },

            isOutdatedVersion: function () {

                var latestVersion  = this.getLatestVersion();
                var currentVersion = this.getVersion();

                if (!currentVersion) {
                    // maybe request failed
                    return false;
                }

                var piwik = require('Piwik');

                return piwik.isVersionGreaterThan(currentVersion, latestVersion);
            },

            // extended functions go here
            showMessageIfIsOutdatedVersion: function () {

                if (this.isOutdatedVersion()) {
                    var L       = require('L');
                    var message = String.format(L('General_PiwikXIsAvailablePleaseNotifyPiwikAdmin'), 
                                                '' + this.getLatestVersion());

                    var alertDialog = Ti.UI.createAlertDialog({
                        title: L('General_PleaseUpdatePiwik'),
                        message: message,
                        buttonNames: [L('General_Ok')]
                    });

                    alertDialog.show();
                    alertDialog = null;
                }
            },

            getVersion: function () {
                return this.get('value');
            }

        }); // end extend
        
        return Model;
    },
    
    
    extendCollection: function(Collection) {        
        _.extend(Collection.prototype, {
            
            // extended functions go here            
            
        }); // end extend
        
        return Collection;
    }

};

