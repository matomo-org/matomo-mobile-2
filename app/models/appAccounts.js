
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

            getAccountById: function (id) {
            
                if (!id) {
                
                    return;
                }
                
                var account = storage.get('account_' + id);
                   
                if (!account || storage.KEY_NOT_FOUND == account) {
                    
                    return;
                }
                
                return account;
            },
            
            activateAccount: function (id) {
                
                return this.updateAccount(id, {active: 1});
            },

            deactivateAccount: function (id) {
                
                return this.updateAccount(id, {active: 0});
            },

            resetPiwikVersion: function (account) {
                
                if (!account) {
                    
                    return account;
                }
                
                account.version            = 0;
                account.dateVersionUpdated = null;
                
                return account;
            },

            updatePiwikVersion: function(account) {
                
                if (!account) {
                    
                    return;
                }
                
                if (!account.dateVersionUpdated) {
                    // version not updated yet. Set it to null. new Date(null) will be Jan 01 1970 and therefore force an update
                    account.dateVersionUpdated = null;
                }
            
                var dateNow             = (new Date()).toDateString();
                var lastUpdatedDate     = new Date(account.dateVersionUpdated);
                var alreadyUpdatedToday = dateNow == lastUpdatedDate.toDateString();
            
                if (alreadyUpdatedToday) {
                    // request it max once per day
                    
                    return;
                }
            
                var piwikRequest = Piwik.require('Network/PiwikApiRequest');
            
                piwikRequest.setMethod('API.getPiwikVersion');
                piwikRequest.setAccount(account);
                piwikRequest.setCallback(this, function (response) {
            
                    if (!account) {
                        
                        return;
                    }
              
                    account.dateVersionUpdated = (new Date()) + '';
                    
                    if (response) {
                        var stringUtils = Piwik.require('Utils/String');
                        account.version = stringUtils.toPiwikVersion(response.value);
                        stringUtils     = null;
                    } else if (!account.version) {
                        account.version = 0;
                    } else {
                        // there went something wrong with the request. For example the network connection broke up.
                        // do not set account version to 0 in such a case. We would overwrite an existing version, eg 183
                    }
            
                    var accountManager = Piwik.require('App/Accounts');
                    accountManager.updateAccount(account.id, {version: account.version, 
                                                              dateVersionUpdated: account.dateVersionUpdated});
                    accountManager     = null;
                    
                    response = null;
                });
                
                // older Piwik versions < 1.8 don't support API.getPiwikVersion. Makes sure those users won't get an error meesage.
                piwikRequest.sendErrors = false;
                
                // execute the request directly. We don't have to add it to a request pool since it doesn't matter when the request
                // finishes. In the worst case the Piwik server version could be outdated for a few seconds
                piwikRequest.send();
                
                piwikRequest = null;
            }








        }); // end extend
        
        return Model;
    },
    
    
    extendCollection: function(Collection) {        
        _.extend(Collection.prototype, {
            
            
            getNumAccounts: function () {

                var accounts = this.getAccounts();
            
                if (accounts && accounts.length) {
            
                    return accounts.length;
                }
            
                return 0;
            },
            
            hasActivedAccount: function () {
                
                var accountIds = storage.get('accounts_available');
                
                if (!accountIds || storage.KEY_NOT_FOUND == accountIds || 0 === accountIds.length) {
                
                    return false;
                }
                
                var accounts   = [];
                
                for (var index = 0; index < accountIds.length; index++) {
                    var accountId = accountIds[index];
                    var account   = this.getAccountById(accountId);
                    
                    if (account && storage.KEY_NOT_FOUND !== account && Boolean(account.active)) {
                        
                        return true;
                    }
                }
            
                return false;
            }

            
        }); // end extend
        
        return Collection;
    }
        
}

