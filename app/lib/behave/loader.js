/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function convertFiletoModule(file)
{
    return file.replace('.js', '');
}

function getUnderscore()
{
    return require('alloy/underscore')._;
}

function findTests(dir, currentDir){
    if (!dir) {
        return [];
    }

    var modules = [];

    getUnderscore().forEach(dir.getDirectoryListing(), function (directoryContent) {
        var file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, currentDir, directoryContent);

        if (file.isDirectory()) {
            var subDir = currentDir + directoryContent + '/';
            modules    = modules.concat(findTests(file, subDir));
        } else if (/_spec.js$/.test(directoryContent)) {
            modules.push(convertFiletoModule(currentDir + (directoryContent)));
        }

    });

    return modules;
}

function getTestsToLoad()
{
    var testsFolder = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'specs');

    return findTests(testsFolder, 'specs/');
}

exports.loadSuits = function () {
    getUnderscore().forEach(getTestsToLoad(), function (testToLoad) {
        require(testToLoad);
    });
};

