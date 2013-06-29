/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function isTestFile(filename)
{
    return !!(/_spec.js$/.test(filename));
}

function findTests(currentDir){
    if (!currentDir) {
        return [];
    }

    var fs = require('fs');
    var testsWithinFolder = fs.list(currentDir);

    var modules = [];

    for (var index = 0; index < testsWithinFolder.length; index++) {
        var directoryContent = testsWithinFolder[index];

        if ('.' === directoryContent || '..' === directoryContent) {
            continue;
        }

        if (fs.isDirectory(currentDir + directoryContent)) {

            var subDir = currentDir + directoryContent + '/';
            modules    = modules.concat(findTests(subDir));

        } else if (isTestFile(directoryContent)) {

            modules.push(currentDir + (directoryContent));
        }
    }

    return modules;
}

var utils    = utils || {};
utils.loader = utils.loader || {};
utils.loader.getTestFiles = function () {
    return findTests('specs/');
};
