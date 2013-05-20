/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function WindowRecorder() {

    var recordWindows    = false;
    var recordedWindows  = [];

    this.on('open', recordWindowIfEnabled);

    function recordWindowIfEnabled(win)
    {
        if (recordWindows) {
            recordedWindows.push(win);
            win.addEventListener('close', removeWindowFromRecordedWindows);
        }
        
        win = null;
    }

    function removeWindowFromRecordedWindows()
    {
        var _     = require('alloy')._;
        var index = _.indexOf(recordedWindows, this);

        if (-1 != index) {
            delete recordedWindows[index];
        }

        this.removeEventListener('close', removeWindowFromRecordedWindows);
    }

    this.startRecordingWindows = function () {
        recordWindows = true;
    };

    this.closeRecordedWindows = function () {
        while (recordedWindows.length) {
            this.close(recordedWindows.shift());
        }
    };
}

exports = WindowRecorder;