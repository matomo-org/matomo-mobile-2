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
            "collection_name": "piwiktokenauth"
        },
        "settings": {
            "method": "UsersManager.getTokenAuth",
            "cache": false
        },
        "defaultParams": {}
    },        

    extendModel: function(Model) {        
        _.extend(Model.prototype, {


            getPasswordHash: function (password) {
                return Ti.Utils.md5HexDigest(password);
            },

            getAnonymousLoginToken: function () {
                return 'anonymous';
            },

            fetchToken: function (accountModel, username, password, onSuccess, onError) {

                if (!username && !password) {

                    onSuccess(this, {value: this.getAnonymousLoginToken()});

                } else {

                    // fetch token via API
                    var passwordHash = this.getPasswordHash(password);
                    
                    this.fetch({
                        account: accountModel,
                        params: {userLogin: username, md5Password: passwordHash},
                        success: onSuccess, 
                        error: onError
                    });
                }
            },

            validResponse: function (response) {
                var _ = require("alloy/underscore");
                 
                if (!response || !_.isObject(response) || !response.value) {
        
                    return false;
                }
                
                return true;
            }

        }); // end extend
        
        return Model;
    },
    
    
    extendCollection: function(Collection) {        
        _.extend(Collection.prototype, {
            
        }); // end extend
        
        return Collection;
    }
        
}

