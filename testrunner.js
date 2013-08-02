/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var page = require('webpage').create();
var fs = require('fs');
var resultDir = 'specs/result';

page.onConsoleMessage = function(msg) {

    if (msg && 0 !== msg.indexOf('JASMINE:')) {
        return;
    }

    if (msg && 0 === msg.indexOf('JASMINE:  >> Jasmine waiting for')) {
        return;
    }

    console.log(msg);
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

page.onInitialized = function() {
    page.evaluate(function() {
        // Workaround for https://github.com/ariya/phantomjs/issues/10647 (Within PhantomJS, onLine is always false)
        var fakeNavigator = {};
        for (var i in navigator) {
            fakeNavigator[i] = navigator[i];
        }
        fakeNavigator.onLine = true;
        navigator = fakeNavigator;
    });
};

function injectJasmine(page)
{
    page.injectJs('specs/jasmine/jasmine.js');
    page.injectJs('specs/jasmine/jasmine-html.js');
    page.injectJs('specs/jasmine/jasmine-reporters/jasmine.phantomjs-reporter.js');
}

function loadTests(page)
{
    phantom.injectJs("specs/jasmine/utils/loader.js");

    var testFiles = utils.loader.getTestFiles();

    for (var index = 0; index < testFiles.length; index++) {
        page.injectJs(testFiles[index]);
    }
}

function runTests(page)
{
    page.evaluate(function () {
        jasmine.getEnv().addReporter(new jasmine.PhantomJSReporter());
        jasmine.getEnv().execute();
    });
}

function generateTestResultsOnceFinished(page)
{
    phantom.injectJs("specs/jasmine/utils/core.js");
    utils.core.waitfor(function() {
        // wait for this to be true
        return page.evaluate(function() {
            return typeof(jasmine.phantomjsXMLReporterPassed) !== "undefined";
        });
    }, function() {
        // once done...
        var suitesResults = page.evaluate(function(){
            return jasmine.phantomjsXMLReporterResults;
        });

        if (!suitesResults) {
            console.log('no tests registered or executed');
        }

        // Return the correct exit status. '0' only if all the tests passed
        phantom.exit(page.evaluate(function(){
            return jasmine.phantomjsXMLReporterPassed ? 0 : 1; //< exit(0) is success, exit(1) is failure
        }));
    }, function() {
        // or, once it timesout...
        phantom.exit(1);
    });
}

page.open('http://127.0.0.1:8061/index.html', function (status) {
    if ('success' !== status) {
        console.error('Failed to load page');
        phantom.exit(1);
        return;
    }

    injectJasmine(page);
    loadTests(page);
    runTests(page);
    generateTestResultsOnceFinished(page);
});