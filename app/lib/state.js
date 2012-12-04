var state = {};

var account = null;

state.setAccount = function (acc) {
    account = acc;
};

state.account = function () {
    return account;
};

module.exports = state;