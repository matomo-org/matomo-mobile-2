
function InitAdapter(config) {
    
}

function Sync(model, method, opts) {
    var name = model.config.adapter.name;
    var settings = model.config.settings;
    var params = model.config.defaultParams;

    Ti.API.info("method " + method);
    
    switch (method) {
        case "read":
        
            // TODO CACHE IF ENABLED
                    
            // TODO we need a central storage for current selected account
            var account = require('state').account();
            
            var _ = require("alloy/underscore");

            if (opts.params) {
                params = _.extend(_.clone(params), opts.params);
            }

            var PiwikApiRequest = require('Piwik/Network/PiwikApiRequest');
            var request  = new PiwikApiRequest();
            request.setMethod(settings.method);
            request.setParameter(params);
            
            if (opts && opts.account) {
                request.setBaseUrl(opts.account.get('accessUrl'));
                request.setUserAuthToken(opts.account.get('tokenAuth'));
            } else if (account) {
                request.setUserAuthToken(account.get('tokenAuth'));
                request.setBaseUrl(account.get('accessUrl'));
            }
            
            request.setCallback(this, function (response) {
                if (_.isUndefined(response) || null === response) {
                    opts.error && opts.error(null);
                } else if (_.isFunction(model.validResponse) && !model.validResponse(response)) {
                    opts.error && opts.error(null);
                } else {
                    opts.success && opts.success(response);
                    model.trigger("fetch");
                }
            });
            
            if (false === settings.displayErrors) {
                request.sendErrors = false;
            }
            
            request.send();
            request = null;
            
            break;
            
        case "create":
        case "update":
        case "delete":
            break;
    }
}

module.exports.sync = Sync, module.exports.beforeModelCreate = function(config) {
    return config = config || {}, config.data = {}, InitAdapter(config), config;
}, module.exports.afterModelCreate = function(Model) {
    return Model = Model || {}, Model.prototype.config.Model = Model, Model;
};