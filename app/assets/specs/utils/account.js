/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

module.exports = {
    getValidAccount: function () {
        return require('alloy').createModel('appAccounts', {
            accessUrl: 'http://demo.matomo.org/index.php',
            tokenAuth: 'anonymous'
        });
    },
    getInvalidAccount: function () {
        return require('alloy').createModel('appAccounts', {
            accessUrl: 'http://demo.matomo.org/index.php',
            tokenAuth: 'c4ca4238a0b923820dcc509a6f75849b'
        });
    }
};