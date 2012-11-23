
function InitAdapter(config) {

}
var _ = require("alloy/underscore")._;

function Sync(model, method, opts) {

    var settings = model.config.settings;
    var apiMethod = settings.apiMethod;
    var params  = settings.params;


    switch (method) {
        case "login":
            break;

        case "create":
            break;

        case "read":
        
            var request = require('alloy/Network/PiwikRequest');
            
            request.setMethod(apiMethod);
            request.setAccount(opts.account);
            request.setParameter(_.extend(params, opts.params));
            
            request.success(function () {
                opts.success && opts.success(pResult, _r.text);
                model.trigger("fetch");
            });
            request.error(function () {
                opts.error && opts.error(e.text);
            });
            request.send();
   
            break;
        case "update":
            break;
        case "delete":
            break;
    }
};

module.exports.sync = Sync, module.exports.beforeModelCreate = function(config) {
    return config = config || {}, config.data = {}, InitAdapter(config), config;
}, module.exports.afterModelCreate = function(Model) {
    return Model = Model || {}, Model.prototype.config.Model = Model, Model;
};