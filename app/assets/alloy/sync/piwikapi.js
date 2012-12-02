
function InitAdapter(config) {
    
}

function Sync(model, method, opts) {
    var name = model.config.adapter.name;
    var settings = model.config.settings;
    var defaultParams = model.config.defaultParams;

    Ti.API.info("method " + method);
    
    switch (method) {
        case "read":
        
            // TODO CACHE IF ENABLED
                    
            var AppAccounts = require("Piwik/App/Accounts");
            // TODO we need a central storage for current selected account
            var accounts    = new AppAccounts().getAccounts();
            
            if (opts.params) {
                // TODO COPY DEFAULT PARAMS
                for (var index in opts.params) {
                    defaultParams[index] = opts.params[index];
                }
            }

            var PiwikApiRequest = require('Piwik/Network/PiwikApiRequest');
            var request  = new PiwikApiRequest();
            request.setMethod(settings.method);
            request.setParameter(defaultParams, opts);
            request.setAccount(accounts[0]);
            request.setCallback(this, function (reports) {
                 if (null !== reports) {
                    opts.success && opts.success(reports);
                    model.trigger("fetch");
                 } else {
                    opts.error && opts.error(null);
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