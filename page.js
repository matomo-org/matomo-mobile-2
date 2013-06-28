var page = require('webpage').create();

// Echo the output of the tests to the Standard Output
page.onConsoleMessage = function(msg, source, linenumber) {
    console.log(msg);
    if ('[INFO] [behave]' == msg.substr(0, 15)) {
        phantom.exit(0);
    }
};

page.onError = function(msg, trace) {
    var msgStack = ['ERROR: ' + msg];
    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
        });
    }
    console.error(msgStack.join('\n'));
};

page.open('http://127.0.0.1:8020/index.html', function () {

    page.evaluate(function () {

        require("specs/models/baseCache_spec");
        require("specs/models/piwikVersion_spec");
        require("specs/models/piwikWebsites_spec");
        behave = require("behave");

        behave.run(this);
    });

});